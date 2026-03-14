FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    iproute2 \
    iputils-ping \
    iptables \
    openfortivpn \
    python3 \
    procps \
    ca-certificates \
    ppp \
    && rm -rf /var/lib/apt/lists/*

# Install Tailscale
RUN curl -fsSL https://tailscale.com/install.sh | sh

WORKDIR /app

COPY entrypoint.sh /entrypoint.sh
COPY vpn-monitor.sh /vpn-monitor.sh
COPY dashboard.py /dashboard.py

RUN chmod +x /entrypoint.sh
RUN chmod +x /vpn-monitor.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]