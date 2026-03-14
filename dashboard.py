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
                "traffic": random.randint(20,120)
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

            color = "bg-emerald-500" if p["online"] else "bg-red-500"

            rows += f"""
<tr class="border-b border-slate-700 hover:bg-slate-700/40">
<td class="p-3">{p['name']}</td>
<td class="p-3 font-mono">{p['ip']}</td>
<td class="p-3">
<span class="px-3 py-1 text-sm rounded-full text-white {color}">
{"Online" if p["online"] else "Offline"}
</span>
</td>
</tr>
"""


        status_color = "text-emerald-400" if vpn == "Connected" else "text-red-400"

        html = f"""
<!DOCTYPE html>
<html>
<head>

<title>Forti-Tailscale Router</title>

<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

</head>

<body class="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">

<div class="max-w-7xl mx-auto p-8">

<div class="flex items-center justify-between mb-10">

<h1 class="text-3xl font-bold tracking-tight">
Forti-Tailscale Router
</h1>

<span class="text-sm text-slate-400">
{time.ctime()}
</span>

</div>


<div class="grid md:grid-cols-3 gap-6 mb-10">

<div class="bg-slate-800/60 backdrop-blur p-6 rounded-2xl border border-slate-700 shadow-xl">
<h2 class="text-slate-400 text-sm mb-2">VPN Status</h2>
<p id="vpn" class="text-3xl font-bold {status_color}">
{vpn}
</p>
</div>


<div class="bg-slate-800/60 backdrop-blur p-6 rounded-2xl border border-slate-700 shadow-xl">
<h2 class="text-slate-400 text-sm mb-2">Connected Peers</h2>
<p class="text-3xl font-bold">{len(peers)}</p>
</div>


<div class="bg-slate-800/60 backdrop-blur p-6 rounded-2xl border border-slate-700 shadow-xl">
<h2 class="text-slate-400 text-sm mb-2">Router Time</h2>
<p class="text-lg">{time.ctime()}</p>
</div>

</div>


<div class="bg-slate-800/60 backdrop-blur p-6 rounded-2xl border border-slate-700 shadow-xl mb-10">

<h2 class="text-xl font-semibold mb-4">
VPN Traffic
</h2>

<canvas id="trafficChart" height="90"></canvas>

</div>


<div class="bg-slate-800/60 backdrop-blur p-6 rounded-2xl border border-slate-700 shadow-xl">

<h2 class="text-xl font-semibold mb-6">
Tailnet Devices
</h2>

<div class="overflow-x-auto">

<table class="w-full text-left text-sm">

<thead class="text-slate-400 border-b border-slate-700">
<tr>
<th class="p-3">Hostname</th>
<th class="p-3">IP Address</th>
<th class="p-3">Status</th>
</tr>
</thead>

<tbody>

{rows}

</tbody>

</table>

</div>

</div>


<div class="text-center text-slate-500 text-xs mt-10">
Forti-Tailscale Router Dashboard
</div>

</div>



<script>

const ctx = document.getElementById("trafficChart");

const chart = new Chart(ctx, {{
type:"line",
data:{{
labels:[],
datasets:[{{
label:"VPN Traffic",
data:[],
borderColor:"#22c55e",
backgroundColor:"rgba(34,197,94,0.2)",
tension:0.35,
fill:true
}}]
}},
options:{{
responsive:true,
plugins:{{
legend:{{display:false}}
}},
scales:{{
x:{{grid:{{display:false}}}},
y:{{grid:{{color:"#334155"}}}}
}}
}}
}});


function update(){{

fetch("/api/status")
.then(r=>r.json())
.then(d=>{{

document.getElementById("vpn").innerText = d.vpn

let now = new Date().toLocaleTimeString()

chart.data.labels.push(now)
chart.data.datasets[0].data.push(d.traffic)

if(chart.data.labels.length>25){{
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