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
const isWin = os.platform() === 'win32';

// Use local files if running on Windows for UI design
const CONFIG_FILE = isWin ? path.join(__dirname, 'config.json') : '/var/lib/tailscale/config.json';
const VPN_STOPPED_FLAG = isWin ? path.join(__dirname, 'vpn_stopped.flag') : '/tmp/vpn_stopped';

const app = express();

const certPath = isWin ? path.join(__dirname, 'server.crt') : '/var/lib/tailscale/server.crt';
const keyPath = isWin ? path.join(__dirname, 'server.key') : '/var/lib/tailscale/server.key';

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    try {
        if (!isWin) {
            execSync(`openssl req -nodes -new -x509 -keyout ${keyPath} -out ${certPath} -days 3650 -subj "/C=US/ST=State/L=City/O=FortiRouter/CN=router.local"`);
        }
    } catch(e) {}
}

const httpsOptions = (fs.existsSync(certPath) && fs.existsSync(keyPath)) 
    ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) } 
    : {};

const httpServer = http.createServer((req, res) => {
    // Redirect HTTP to HTTPS, or serve normally if no certs (like on Windows dev)
    if (httpsOptions.key) {
        const host = req.headers['host'] ? req.headers['host'].replace(/:\d+$/, '') : 'localhost';
        res.writeHead(301, { "Location": "https://" + host + req.url });
        res.end();
    } else {
        app(req, res);
    }
});

const httpsServer = httpsOptions.key ? https.createServer(httpsOptions, app) : null;
const io = new Server(httpsServer || httpServer, { cors: { origin: '*' } });

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
    if (isWin) {
        console.log("Mock applying VPN config on Windows");
        return;
    }
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
    if (!isWin) { try { execSync('killall openfortivpn'); } catch(e) {} }
    res.json({ success: true });
});

app.post('/api/vpn/start', (req, res) => {
    if (fs.existsSync(VPN_STOPPED_FLAG)) fs.unlinkSync(VPN_STOPPED_FLAG);
    if (!isWin) { try { execSync('killall openfortivpn'); } catch(e) {} }
    res.json({ success: true });
});

app.post('/api/vpn/stop', (req, res) => {
    fs.writeFileSync(VPN_STOPPED_FLAG, 'stopped');
    if (!isWin) { try { execSync('killall openfortivpn'); } catch(e) {} }
    res.json({ success: true });
});

app.post('/api/vpn/restart', (req, res) => {
    if (fs.existsSync(VPN_STOPPED_FLAG)) fs.unlinkSync(VPN_STOPPED_FLAG);
    if (!isWin) { try { execSync('killall openfortivpn'); } catch(e) {} }
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
    if (isWin) return 'Connected (Windows Mock)';
    try {
        const out = execSync('ip addr').toString();
        if (out.includes('ppp0')) return 'Connected';
    } catch (e) {}
    return 'Disconnected';
}

function getPeers() {
    if (isWin) return [
        { name: 'ajayos-laptop', ip: '100.101.102.103', online: true, lastSeen: Date.now() - 5000, id: 'node-a1b2c' },
        { name: 'forti-gateway', ip: '100.80.80.80', online: true, lastSeen: Date.now() - 1000, id: 'node-f3g4h' },
        { name: 'offline-server', ip: '100.70.70.70', online: false, lastSeen: Date.now() - 86400000 * 5, id: 'node-x9y8z' }
    ];
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
                    online: p.Online || false,
                    lastSeen: p.LastSeen ? new Date(p.LastSeen).getTime() : 0,
                    id: p.ID || key.substring(0,8)
                });
            }
        }
        return peers;
    } catch (e) { return []; }
}

function getRoutingInfo() {
    if (isWin) return { routes: '10.0.0.0/8 dev ppp0\n192.168.1.0/24 dev ppp0\n(Mocked for Windows)', tailscaleStatus: 'Logged in.\nExit node available.' };
    try {
        const routes = execSync('ip route').toString();
        const tailscaleStatus = execSync('tailscale status').toString();
        return { routes, tailscaleStatus };
    } catch(e) { return { routes: '', tailscaleStatus: '' }; }
}

let lastRx = 0; let lastTx = 0; let lastTime = Date.now();
let totalRx = 0; let totalTx = 0;

function getTraffic() {
    if (isWin) {
        totalRx += 500000; totalTx += 200000;
        return { downloadRate: Math.random() * 5000000, uploadRate: Math.random() * 2000000, totalDownload: totalRx, totalUpload: totalTx };
    }
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
            totalRx += (rx - lastRx);
            totalTx += (tx - lastTx);
        }
        lastRx = rx; lastTx = tx; lastTime = now;
        return { downloadRate, uploadRate, totalDownload: totalRx, totalUpload: totalTx };
    } catch(e) { return { downloadRate: 0, uploadRate: 0, totalDownload: totalRx, totalUpload: totalTx }; }
}

let pingSum = 0; let pingCount = 0;
function getPing() {
    let p = -1;
    if (isWin) {
        p = 15 + Math.random() * 10;
    } else {
        try {
            const conf = loadConfig();
            const target = conf.pingTarget || '8.8.8.8';
            const out = execSync(`ping -c 1 -W 1 ${target}`).toString();
            const match = out.match(/time=([\d.]+)\s*ms/);
            if (match) p = parseFloat(match[1]);
        } catch(e) {}
    }
    if (p > 0) { pingSum += p; pingCount++; }
    return { current: p, average: pingCount > 0 ? (pingSum / pingCount) : -1 };
}

function getSystemHealth() {
    if (isWin) return {
        cpuLoad: [Math.random() * 2, Math.random(), 0.5],
        totalMem: os.totalmem(),
        freeMem: os.freemem(),
        uptime: os.uptime(),
        cores: os.cpus().length,
        osInfo: `${os.type()} ${os.release()} (Windows Dev Mock)`
    };
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
    if (isWin) return 1;
    try {
        const out = execSync('ps aux | grep openfortivpn | grep -v grep').toString();
        return out.split('\n').filter(Boolean).length;
    } catch(e) { return 0; }
}

let cachedPublicIp = null;
function getServerIps() {
    if (isWin) return { internal: '100.80.80.80 (Mock)', publicIp: '203.0.113.1 (Mock)' };
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

// --- Specific Uptimes ---
const serverStartTime = Date.now();
let mockVpnStart = Date.now() - 3600000;
let mockTailscaleStart = Date.now() - 86400000 * 2;

function getServiceUptimes() {
    let vpnUptime = 0;
    let tsUptime = 0;
    
    if (isWin) {
        vpnUptime = (Date.now() - mockVpnStart) / 1000;
        tsUptime = (Date.now() - mockTailscaleStart) / 1000;
    } else {
        try {
            // Check openfortivpn process
            const outVpn = execSync("ps -o etimes= -C openfortivpn").toString().trim().split('\n')[0];
            vpnUptime = parseInt(outVpn) || 0;
        } catch(e) {}
        try {
            // Check tailscaled process
            const outTs = execSync("ps -o etimes= -C tailscaled").toString().trim().split('\n')[0];
            tsUptime = parseInt(outTs) || 0;
        } catch(e) {}
    }
    
    return {
        system: os.uptime(),
        server: (Date.now() - serverStartTime) / 1000,
        vpn: vpnUptime,
        tailscale: tsUptime
    };
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
        uptimes: getServiceUptimes(),
        timestamp: Date.now()
    });
}, 2000);

const LISTENING_PORT = isWin ? 8080 : HTTP_PORT; // Use 8080 for HTTP dev on Windows, 80 for production Docker

httpServer.listen(LISTENING_PORT, '0.0.0.0', () => {
    console.log(`HTTP server running on port ${LISTENING_PORT} ${httpsServer ? '(Redirecting to HTTPS)' : ''}`);
});

if (httpsServer) {
    httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
        console.log(`HTTPS/WebSocket server running on port ${HTTPS_PORT}`);
    });
}
