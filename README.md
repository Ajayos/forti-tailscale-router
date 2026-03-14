# Forti-Tailscale Exit Node

<p align="center">
<img src="https://raw.githubusercontent.com/tailscale/tailscale/main/docs/static/images/tailscale-logo.svg" width="120"/>

<h3>FortiGate VPN → Docker → Tailscale Exit Node</h3>

A lightweight Docker container that connects to a **FortiGate SSL VPN** and exposes the connection as a **Tailscale Exit Node**, allowing devices in your tailnet to route traffic through the VPN securely.

</p>

---

# Overview

**Forti-Tailscale Exit Node** is a containerized gateway that bridges **FortiGate SSL VPN** and **Tailscale**.

Instead of advertising internal routes, the container operates as a **Tailscale Exit Node**, allowing tailnet devices to route their traffic through the FortiGate VPN tunnel.

This enables secure access to the internet or corporate resources through the VPN from anywhere in your tailnet.

---

# Architecture

```
Tailnet Devices
      │
      │
Tailscale Network
      │
      │
┌──────────────────────────┐
│   Forti-Tailscale Router │
│                          │
│  tailscaled              │
│  openfortivpn            │
│  vpn monitor             │
│  dashboard               │
└──────────────────────────┘
      │
      │
FortiGate SSL VPN
      │
      │
Internet / Corporate Network
```

---

# Features

• FortiGate SSL VPN support via `openfortivpn`
• Tailscale integration
• Runs as a **Tailscale Exit Node**
• Automatic VPN reconnect
• Built-in health checks
• Web dashboard for monitoring
• Docker-based deployment
• Environment-variable configuration
• Secure remote access through VPN

---

# Use Cases

• Remote developer environments
• Secure internet routing via corporate VPN
• Private infrastructure access
• DevOps internal networking
• Homelab VPN gateway

---

# Project Structure

```
forti-tailscale-exit-node
│
├── Dockerfile
├── entrypoint.sh
├── vpn-monitor.sh
├── dashboard.py
└── README.md
```

---

# Requirements

Before running the container ensure you have:

• Docker installed
• A FortiGate VPN account
• Tailscale account
• Tailscale authentication key

Install Docker:

```
https://docs.docker.com/get-docker/
```

Generate Tailscale auth key:

```
https://login.tailscale.com/admin/settings/keys
```

---

# Build Docker Image

Clone the repository:

```bash
git clone https://github.com/ajayos/forti-tailscale-exit-node.git
cd forti-tailscale-exit-node
```

Build the image:

```bash
docker build -t forti-tailscale-exit-node .
```

---

# Run Container

Example deployment:

```bash
docker run -d \
--name forti-exit-node \
--cap-add=NET_ADMIN \
--device /dev/net/tun \
-p 8080:8080 \
-e FORTI_HOST=1.2.3.4 \
-e FORTI_PORT=443 \
-e FORTI_USERNAME=username \
-e FORTI_PASSWORD=password \
-e FORTI_CERT=abcdef123456 \
-e TAILSCALE_AUTHKEY=tskey-xxxxxxxx \
-e TAILSCALE_HOSTNAME=forti-exit-node \
forti-tailscale-exit-node
```

---

# Configuration

The container is configured entirely through **environment variables**.

| Variable           | Description                               |
| ------------------ | ----------------------------------------- |
| FORTI_HOST         | FortiGate VPN hostname or IP              |
| FORTI_PORT         | VPN port (default 443)                    |
| FORTI_USERNAME     | VPN login username                        |
| FORTI_PASSWORD     | VPN password                              |
| FORTI_CERT         | FortiGate trusted certificate fingerprint |
| TAILSCALE_AUTHKEY  | Tailscale auth key                        |
| TAILSCALE_HOSTNAME | Node hostname in tailnet                  |

Example configuration:

```
FORTI_HOST=vpn.company.com
FORTI_PORT=443
FORTI_USERNAME=devuser
FORTI_PASSWORD=password
FORTI_CERT=abcdef123456
TAILSCALE_AUTHKEY=tskey-xxxxx
TAILSCALE_HOSTNAME=forti-exit-node
```

---

# Enable Exit Node (Client)

Once the container is running, enable the exit node from your device.

Using CLI:

```
tailscale up --exit-node=forti-exit-node
```

Or enable it from the **Tailscale Admin Console**.

After enabling, your device traffic flows through:

```
Device → Tailnet → Exit Node → FortiGate VPN
```

---

# Dashboard

A simple monitoring dashboard is available.

Open:

```
http://SERVER_IP:8080
```

Dashboard shows:

• VPN connection status
• Tailscale status
• system information

---

# Health Checks

Docker health monitoring is included.

Check container health:

```
docker ps
```

Example output:

```
forti-exit-node   healthy
```

If the VPN drops, the container automatically reconnects.

---

# Logs

View runtime logs:

```bash
docker logs forti-exit-node
```

Logs include:

• VPN reconnect attempts
• connection status
• tailscale events
• system logs

---


# Troubleshooting

### VPN Not Connecting

Check logs:

```
docker logs forti-exit-node
```

Verify:

• VPN host
• username/password
• certificate fingerprint

---

### Tailscale Not Connecting

Verify auth key:

```
TAILSCALE_AUTHKEY
```

Ensure the device appears in:

```
https://login.tailscale.com/admin/machines
```

---

# Contributing

Pull requests and improvements are welcome.

Areas where contributions are appreciated:

• improved monitoring
• better dashboard UI
• configuration management
• networking optimizations

---

# License

Apache 2.0 License

---

# Author

Created by **Ajay OS**

Website:

```
https://ajayos.com
```

---

# Support

If you find this project useful, consider giving it a ⭐ on GitHub.
