const express = require('express');
const http = require('http');
const https = require('https');
const { Server } = require('socket.io');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const HTTP_PORT = 80;
const HTTPS_PORT = 443;
const CONFIG_FILE = '/var/lib/tailscale/config.json';
const VPN_STOPPED_FLAG = '/tmp/vpn_stopped';

const app = express();

const certPath = '/var/lib/tailscale/server.crt';
const keyPath = '/var/lib/tailscale/server.key';

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    try {
        execSync(`openssl req -nodes -new -x509 -keyout ${keyPath} -out ${certPath} -days 3650 -subj "/C=US/ST=State/L=City/O=FortiRouter/CN=router.local"`);
    } catch(e) {}
}

const httpsOptions = (fs.existsSync(certPath) && fs.existsSync(keyPath)) 
    ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) } 
    : {};

const httpServer = http.createServer((req, res) => {
    // Redirect HTTP to HTTPS
    const host = req.headers['host'] ? req.headers['host'].replace(/:\d+$/, '') : 'localhost';
    res.writeHead(301, { "Location": "https://" + host + req.url });
    res.end();
});

const httpsServer = httpsOptions.key ? https.createServer(httpsOptions, app) : http.createServer(app);
const io = new Server(httpsServer, { cors: { origin: '*' } });

app.use(express.json());

// --- Config Management ---
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        }
    } catch(e) {}
    return {
        fortiHost: process.env.FORTI_HOST || '',
        fortiPort: process.env.FORTI_PORT || '443',
        fortiUser: process.env.FORTI_USERNAME || '',
        fortiPass: process.env.FORTI_PASSWORD || '',
        fortiCert: process.env.FORTI_CERT || '',
        tailscaleSubnets: process.env.TAILSCALE_SUBNETS || '',
        pingTarget: process.env.PING_TARGET || '8.8.8.8'
    };
}

function saveConfig(config) {
    fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function applyVpnConfig(config) {
    const confContent = `host = ${config.fortiHost}\nport = ${config.fortiPort}\nusername = ${config.fortiUser}\npassword = ${config.fortiPass}\ntrusted-cert = ${config.fortiCert}\nset-routes = 1\npppd-use-peerdns = 1\n`;
    fs.writeFileSync('/tmp/fortivpn.conf', confContent);
}

// Initial application of config
applyVpnConfig(loadConfig());

// --- API Endpoints ---
app.get('/api/config', (req, res) => res.json(loadConfig()));

app.post('/api/config', (req, res) => {
    saveConfig(req.body);
    applyVpnConfig(req.body);
    try { execSync('killall openfortivpn'); } catch(e) {}
    res.json({ success: true });
});

app.post('/api/vpn/start', (req, res) => {
    if (fs.existsSync(VPN_STOPPED_FLAG)) fs.unlinkSync(VPN_STOPPED_FLAG);
    try { execSync('killall openfortivpn'); } catch(e) {}
    res.json({ success: true });
});

app.post('/api/vpn/stop', (req, res) => {
    fs.writeFileSync(VPN_STOPPED_FLAG, 'stopped');
    try { execSync('killall openfortivpn'); } catch(e) {}
    res.json({ success: true });
});

app.get('/api/vpn/status', (req, res) => {
    res.json({ isStopped: fs.existsSync(VPN_STOPPED_FLAG) });
});

// --- Static Frontend ---
app.use(express.static('./web/dist'));
app.get('*', (req, res) => res.sendFile(path.resolve('./web/dist/index.html')));

// --- Metrics Gathering ---
function getVpnStatus() {
    if (fs.existsSync(VPN_STOPPED_FLAG)) return 'Stopped manually';
    try {
        const out = execSync('ip addr').toString();
        if (out.includes('ppp0')) return 'Connected';
    } catch (e) {}
    return 'Disconnected';
}

function getPeers() {
    try {
        const data = execSync('tailscale status --json').toString();
        const js = JSON.parse(data);
        const peers = [];
        if (js.Peer) {
            for (const key of Object.keys(js.Peer)) {
                const p = js.Peer[key];
                peers.push({
                    name: p.HostName || 'Unknown',
                    ip: (p.TailscaleIPs && p.TailscaleIPs.length > 0) ? p.TailscaleIPs[0] : '',
                    online: p.Online || false
                });
            }
        }
        return peers;
    } catch (e) { return []; }
}

function getRoutingInfo() {
    try {
        const routes = execSync('ip route').toString();
        const tailscaleStatus = execSync('tailscale status').toString();
        return { routes, tailscaleStatus };
    } catch(e) { return { routes: '', tailscaleStatus: '' }; }
}

let lastRx = 0; let lastTx = 0; let lastTime = Date.now();
function getTraffic() {
    try {
        const dev = fs.readFileSync('/proc/net/dev', 'utf8');
        const lines = dev.split('\n');
        let rx = 0; let tx = 0;
        for (const line of lines) {
            if (line.includes('ppp0:') || line.includes('tailscale0:')) {
                const parts = line.trim().split(/\s+/).filter(Boolean);
                rx += parseInt(parts[1] || '0', 10);
                tx += parseInt(parts[9] || '0', 10);
            }
        }
        const now = Date.now();
        const dt = (now - lastTime) / 1000;
        let downloadRate = 0; let uploadRate = 0;
        if (dt > 0 && lastRx > 0) {
            downloadRate = Math.max(0, (rx - lastRx) / dt);
            uploadRate = Math.max(0, (tx - lastTx) / dt);
        }
        lastRx = rx; lastTx = tx; lastTime = now;
        return { downloadRate, uploadRate };
    } catch(e) { return { downloadRate: 0, uploadRate: 0 }; }
}

function getPing() {
    try {
        const conf = loadConfig();
        const target = conf.pingTarget || '8.8.8.8';
        const out = execSync(`ping -c 1 -W 1 ${target}`).toString();
        const match = out.match(/time=([\d.]+)\s*ms/);
        if (match) return parseFloat(match[1]);
    } catch(e) {}
    return -1;
}

function getSystemHealth() {
    return {
        cpuLoad: os.loadavg(),
        totalMem: os.totalmem(),
        freeMem: os.freemem(),
        uptime: os.uptime(),
        cores: os.cpus().length,
        osInfo: `${os.type()} ${os.release()}`
    };
}

function getVpnInstances() {
    try {
        const out = execSync('ps aux | grep openfortivpn | grep -v grep').toString();
        return out.split('\n').filter(Boolean).length;
    } catch(e) { return 0; }
}

let cachedPublicIp = null;
function getServerIps() {
    let internal = '';
    try {
        const out = execSync('ip -4 addr show tailscale0').toString();
        const match = out.match(/inet\s+([\d.]+)/);
        if (match) internal = match[1];
    } catch(e) {}
    
    if (!cachedPublicIp) {
        try {
            cachedPublicIp = execSync('curl -s --max-time 1 ifconfig.me').toString().trim();
        } catch(e) { cachedPublicIp = 'Unavailable'; }
    }
    return { internal, publicIp: cachedPublicIp };
}

// --- WebSocket Stream ---
setInterval(() => {
    io.emit('metrics', {
        vpn: getVpnStatus(),
        peers: getPeers(),
        traffic: getTraffic(),
        ping: getPing(),
        routing: getRoutingInfo(),
        health: getSystemHealth(),
        instances: getVpnInstances(),
        ips: getServerIps(),
        timestamp: Date.now()
    });
}, 2000);

httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`HTTP server running on port ${HTTP_PORT} (Redirecting to HTTPS)`);
});

httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`HTTPS/WebSocket server running on port ${HTTPS_PORT}`);
});
