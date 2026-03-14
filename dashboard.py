from http.server import BaseHTTPRequestHandler, HTTPServer
import subprocess
import json

PORT = 8080


def get_vpn_status():
    try:
        output = subprocess.check_output("ip addr", shell=True).decode()
        if "ppp0" in output:
            return "Connected"
    except:
        pass
    return "Disconnected"


def get_tailscale_peers():
    try:
        data = subprocess.check_output("tailscale status --json", shell=True)
        js = json.loads(data)

        peers = []

        for peer in js.get("Peer", {}).values():
            peers.append({
                "name": peer.get("HostName"),
                "ip": peer.get("TailscaleIPs", [""])[0],
                "online": peer.get("Online", False)
            })

        return peers
    except:
        return []


class Handler(BaseHTTPRequestHandler):

    def do_GET(self):

        if self.path == "/api/status":

            data = {
                "vpn": get_vpn_status(),
                "peers": get_tailscale_peers()
            }

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(data).encode())
            return

        vpn_status = get_vpn_status()
        peers = get_tailscale_peers()

        peer_rows = ""

        for p in peers:

            status_color = "bg-green-500" if p["online"] else "bg-red-500"

            peer_rows += f"""
            <tr class="border-b border-slate-700">
                <td class="p-2">{p['name']}</td>
                <td class="p-2">{p['ip']}</td>
                <td class="p-2">
                <span class="px-2 py-1 rounded text-white {status_color}">
                {"Online" if p['online'] else "Offline"}
                </span>
                </td>
            </tr>
            """

        html = f"""
<!DOCTYPE html>
<html>

<head>

<title>Forti Tailscale Dashboard</title>

<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

</head>

<body class="bg-slate-900 text-white">

<div class="p-6">

<h1 class="text-3xl font-bold mb-6">
Forti Tailscale Exit Node
</h1>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6">

<div class="bg-slate-800 p-4 rounded-xl">
<h2 class="text-xl mb-2">VPN Status</h2>
<p id="vpnStatus" class="text-2xl font-bold">
{vpn_status}
</p>
</div>

<div class="bg-slate-800 p-4 rounded-xl">
<h2 class="text-xl mb-2">Peers</h2>
<p class="text-2xl font-bold">
{len(peers)}
</p>
</div>

<div class="bg-slate-800 p-4 rounded-xl">
<h2 class="text-xl mb-2">Dashboard</h2>
<p>Live Monitoring</p>
</div>

</div>

<div class="mt-8 bg-slate-800 p-6 rounded-xl">

<h2 class="text-xl mb-4">VPN Traffic</h2>

<canvas id="trafficChart"></canvas>

</div>


<div class="mt-8 bg-slate-800 p-6 rounded-xl">

<h2 class="text-xl mb-4">Tailnet Peers</h2>

<table class="w-full text-left">

<thead class="border-b border-slate-700">
<tr>
<th class="p-2">Hostname</th>
<th class="p-2">IP</th>
<th class="p-2">Status</th>
</tr>
</thead>

<tbody id="peerTable">

{peer_rows}

</tbody>

</table>

</div>


<div class="mt-8 bg-slate-800 p-6 rounded-xl">

<h2 class="text-xl mb-4">Tailnet Map</h2>

<div id="map" class="h-64 flex items-center justify-center text-slate-400">

Tailnet visualization placeholder

</div>

</div>

</div>


<script>

const ctx = document.getElementById('trafficChart').getContext('2d');

const chart = new Chart(ctx, {{
type: 'line',
data: {{
labels: [],
datasets: [{{
label: 'VPN Traffic',
data: [],
borderColor: 'rgb(59,130,246)',
tension: 0.3
}}]
}},
options: {{
responsive:true
}}
}});


function updateData() {{

fetch('/api/status')
.then(r=>r.json())
.then(data=>{{

document.getElementById("vpnStatus").innerText = data.vpn;

let now = new Date().toLocaleTimeString();

chart.data.labels.push(now);

chart.data.datasets[0].data.push(Math.random()*100);

if(chart.data.labels.length > 20) {{
chart.data.labels.shift();
chart.data.datasets[0].data.shift();
}}

chart.update();

}})
}}

setInterval(updateData,3000)

</script>

</body>

</html>
"""

        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(html.encode())


server = HTTPServer(("0.0.0.0", PORT), Handler)

print("Dashboard running on port", PORT)

server.serve_forever()