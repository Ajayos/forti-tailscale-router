<div align="center">
  <img src="./logo.png" alt="Forti-Tailscale Router Logo" width="200"/>
  <h1>Forti-Tailscale Gateway Router</h1>
  <p><b>FortiGate VPN → Docker → Tailscale Exit Node</b></p>
  <p>A lightweight container that connects to a FortiGate SSL VPN and exposes the connection as a Tailscale Exit Node, allowing devices in your tailnet to securely route traffic through the VPN.</p>

  ![Forti-Tailscale](https://img.shields.io/badge/Fortinet-Tailscale-blue?style=for-the-badge&logo=tailscale)
  ![NodeJS](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=nodedotjs)
  ![React](https://img.shields.io/badge/React-Vite-blue?style=for-the-badge&logo=react)
  ![Docker](https://img.shields.io/badge/Docker-Container-2496ED?style=for-the-badge&logo=docker)
</div>

---

## 📖 Overview

**Forti-Tailscale Router** is a containerized gateway that bridges **FortiGate SSL VPN** and **Tailscale**.

Instead of advertising internal subnets, the container operates as a **Tailscale Exit Node**, allowing tailnet devices to send their traffic through the FortiGate VPN tunnel. This enables secure access to the internet or corporate resources through the VPN from anywhere in your tailnet, entirely eliminating the need to install FortiClient software on every employee's device.

It features a cutting-edge **Real-Time Web UI** powered by WebSockets, allowing you to visually manage the VPN, configure settings, monitor network traffic, and diagnose connection health—all from your browser.

The container image is published on **Quay** and can be pulled directly.
Image repository:
```text
https://quay.io/repository/ajayos/forti-tailscale-router
```

---

## 🏗️ Architecture

```text
Tailnet Devices
      │
      │
Tailscale Network
      │
      │
┌─────────────────────────────┐
│   Forti-Tailscale Router    │
│                             │
│   tailscaled                │
│   openfortivpn              │
│   vpn-monitor               │
│   dashboard                 │
└─────────────────────────────┘
      │
      │
FortiGate SSL VPN
      │
      │
Internet / Corporate Network
```

---

## 📦 Container Image

The container image is hosted on **Quay**.

Pull the image:
```bash
docker pull quay.io/ajayos/forti-tailscale-router:latest
```

Repository:
```text
quay.io/ajayos/forti-tailscale-router
```

---

## 🚀 Features

- **FortiGate SSL VPN support** using `openfortivpn`
- **Tailscale integration**
- **Runs as a Tailscale Exit Node**
- **Automatic VPN reconnect** via built-in health monitor
- **Tailscale SSH support**
- **Web dashboard for monitoring** via React and WebSockets
- **Docker-based deployment**
- **Environment variable & UI configuration** (Fully stateful persistence)
- **Tailnet peer monitoring**
- **Live VPN traffic visualization** (Upload/Download & Ping graphs)

---

## 💼 Use Cases

- Remote developer environments
- Secure internet routing via corporate VPN
- Private infrastructure access
- DevOps internal networking
- Homelab VPN gateway
- Secure remote browsing through VPN

---

## 📝 Requirements

Before running the container ensure you have:
- Docker installed ([Get Docker](https://docs.docs/get-docker/))
- A FortiGate VPN account
- A Tailscale account
- A Tailscale authentication key ([Generate at Tailscale Admin](https://login.tailscale.com/admin/settings/keys))

---

## 🚀 Run Container

Pull and run the container directly from **Quay**.

You **MUST** map `/var/lib/tailscale` to a persistent local volume to ensure your Tailscale Machine State and your Web UI Configuration are saved across restarts.

**Example deployment:**
```bash
docker run -d \
  --name forti-tailscale-router \
  --cap-add=NET_ADMIN \
  --device /dev/net/tun \
  --device /dev/ppp \
  --privileged \
  --network host \
  -v tailscale-state:/var/lib/tailscale \
  -p 80:80 \
  -p 443:443 \
  -e FORTI_HOST=1.2.3.4 \
  -e FORTI_PORT=443 \
  -e FORTI_USERNAME=username \
  -e FORTI_PASSWORD=password \
  -e FORTI_CERT=abcdef123456 \
  -e TAILSCALE_AUTHKEY=tskey-xxxxxxxx \
  -e TAILSCALE_HOSTNAME=forti-exit-node \
  quay.io/ajayos/forti-tailscale-router:latest
```

> **Note**: Because `--network host` is used, the Web UI will automatically be available on your host machine's port `80` (HTTP) and `443` (HTTPS).

---

## ⚙️ Configuration

The container can be configured entirely using **environment variables** on initial boot. Once booted, the configuration is seamlessly persisted and can be dynamically managed directly from the Web UI.

| Variable           | Description                               |
| ------------------ | ----------------------------------------- |
| `FORTI_HOST`       | FortiGate VPN hostname or IP              |
| `FORTI_PORT`       | VPN port (usually 443)                    |
| `FORTI_USERNAME`   | VPN login username                        |
| `FORTI_PASSWORD`   | VPN password                              |
| `FORTI_CERT`       | FortiGate trusted certificate fingerprint |
| `TAILSCALE_AUTHKEY`| Tailscale authentication key              |
| `TAILSCALE_HOSTNAME`| Node hostname in tailnet                 |

Example configuration:
```text
FORTI_HOST=vpn.company.com
FORTI_PORT=443
FORTI_USERNAME=devuser
FORTI_PASSWORD=password
FORTI_CERT=abcdef123456
TAILSCALE_AUTHKEY=tskey-xxxxx
TAILSCALE_HOSTNAME=forti-exit-node
```

---

## 🌐 Dashboard

A built-in monitoring dashboard is available.

Open in your browser:
```text
`https://SERVER_IP` (or `http://SERVER_IP`)
```

**Dashboard displays:**
- VPN connection status & Ping latency
- Tailscale peer list
- Tailnet device status
- Live VPN traffic graph
- System information (OS info, Cores, Uptime)
- Manual Override Controls (Start VPN / Stop VPN)

---

## 🌍 Enable Exit Node

Once the container is running, enable the exit node from your device.

Using CLI:
```bash
tailscale up --exit-node=forti-exit-node
```

Or enable it through the **Tailscale Admin Console**.

Traffic path becomes:
```text
Device → Tailnet → Exit Node → FortiGate VPN
```

---

## 📄 Logs

View runtime logs with:
```bash
docker logs forti-tailscale-router
```

Logs include:
- VPN connection attempts
- Auto reconnect events
- Tailscale network status
- Dashboard activity

---

## 🔧 Troubleshooting

### VPN Not Connecting
Check container logs:
```bash
docker logs forti-tailscale-router
```
Verify:
- VPN host
- username/password
- certificate fingerprint
- **Ping Monitor Target** (If your configured ping target is unreachable, the VPN monitor will intentionally sever and restart the connection).

### Tailscale Not Connecting
Verify the auth key:
```text
TAILSCALE_AUTHKEY
```
Ensure the node appears in:
```text
https://login.tailscale.com/admin/machines
```

---

## 🔒 Security Notes

Do **not commit VPN credentials** to source control.

Recommended practices:
- Use environment variables
- Use Docker secrets in production
- Rotate Tailscale auth keys regularly
- Restrict dashboard port access

---

## 🤝 Contributing

Pull requests and improvements are welcome.

Possible areas of improvement:
- Enhanced dashboard UI
- Advanced network monitoring
- Better traffic metrics
- Multi-VPN configuration

---

## ⚖️ License

Apache 2.0 License

---

## 👨‍💻 Author

Created by **Ajay OS**

Website:
```text
https://ajayos.com
```

---

## 📦 Container Registry

Image hosted on **Quay Container Registry**:
```text
https://quay.io/repository/ajayos/forti-tailscale-router
```

---

## ❤️ Support

If you find this project useful, consider giving it a ⭐ on GitHub.
