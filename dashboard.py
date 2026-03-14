from http.server import BaseHTTPRequestHandler, HTTPServer
import subprocess
import json
import time
import random

PORT = 8080


def get_vpn_status():
    try:
        out = subprocess.check_output(["ip","addr"]).decode()
        if "ppp0" in out:
            return "Connected"
    except:
        pass
    return "Disconnected"


def get_peers():
    try:
        data = subprocess.check_output(["tailscale","status","--json"])
        js = json.loads(data)

        peers = []

        for p in js.get("Peer",{}).values():
            peers.append({
                "name": p.get("HostName"),
                "ip": p.get("TailscaleIPs",[""])[0],
                "online": p.get("Online",False)
            })

        return peers
    except:
        return []


class Handler(BaseHTTPRequestHandler):

    def do_GET(self):

        if self.path == "/api/status":

            data = {
                "vpn": get_vpn_status(),
                "peers": get_peers(),
                "traffic": random.randint(10,120)
            }

            self.send_response(200)
            self.send_header("Content-Type","application/json")
            self.end_headers()
            self.wfile.write(json.dumps(data).encode())
            return


        vpn = get_vpn_status()
        peers = get_peers()

        rows = ""

        for p in peers:

            color = "bg-green-500" if p["online"] else "bg-red-500"

            rows += f"""
<tr class="border-b border-slate-700">
<td class="p-2">{p['name']}</td>
<td class="p-2">{p['ip']}</td>
<td class="p-2">
<span class="px-2 py-1 rounded {color}">
{"Online" if p["online"] else "Offline"}
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

<div class="p-8 max-w-6xl mx-auto">

<h1 class="text-3xl font-bold mb-8">
Forti-Tailscale Exit Node
</h1>

<div class="grid grid-cols-3 gap-6">

<div class="bg-slate-800 p-5 rounded-xl">
<h2 class="text-lg">VPN Status</h2>
<p id="vpn" class="text-2xl font-bold">{vpn}</p>
</div>

<div class="bg-slate-800 p-5 rounded-xl">
<h2 class="text-lg">Peers</h2>
<p class="text-2xl">{len(peers)}</p>
</div>

<div class="bg-slate-800 p-5 rounded-xl">
<h2 class="text-lg">Server Time</h2>
<p>{time.ctime()}</p>
</div>

</div>

<div class="mt-10 bg-slate-800 p-6 rounded-xl">

<h2 class="text-xl mb-4">VPN Traffic</h2>

<canvas id="trafficChart"></canvas>

</div>

<div class="mt-10 bg-slate-800 p-6 rounded-xl">

<h2 class="text-xl mb-4">Tailnet Peers</h2>

<table class="w-full text-left">

<thead>
<tr>
<th class="p-2">Hostname</th>
<th class="p-2">IP</th>
<th class="p-2">Status</th>
</tr>
</thead>

<tbody>

{rows}

</tbody>

</table>

</div>

</div>

<script>

const ctx = document.getElementById("trafficChart");

const chart = new Chart(ctx, {{
type:"line",
data:{{labels:[],datasets:[{{label:"Traffic",data:[],borderColor:"rgb(59,130,246)"}}]}},
options:{{responsive:true}}
}});

function update(){{
fetch("/api/status")
.then(r=>r.json())
.then(d=>{{

document.getElementById("vpn").innerText=d.vpn;

let t=new Date().toLocaleTimeString()

chart.data.labels.push(t)
chart.data.datasets[0].data.push(d.traffic)

if(chart.data.labels.length>20){{
chart.data.labels.shift()
chart.data.datasets[0].data.shift()
}}

chart.update()

}})
}}

setInterval(update,3000)

</script>

</body>
</html>
"""

        self.send_response(200)
        self.send_header("Content-type","text/html")
        self.end_headers()
        self.wfile.write(html.encode())


server = HTTPServer(("0.0.0.0",PORT),Handler)

print("Dashboard running on port",PORT)

server.serve_forever()