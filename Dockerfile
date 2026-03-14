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
    nano \
    ppp \
    && rm -rf /var/lib/apt/lists/*

# Install Tailscale
RUN curl -fsSL https://tailscale.com/install.sh | sh

WORKDIR /app

COPY entrypoint.sh /entrypoint.sh
COPY vpn-monitor.sh /vpn-monitor.sh
COPY dashboard.py /dashboard.py
COPY banner.sh /usr/local/bin/banner.sh

RUN chmod +x /entrypoint.sh \
 && chmod +x /vpn-monitor.sh \
 && chmod +x /usr/local/bin/banner.sh \
 && chmod -x /etc/update-motd.d/*

RUN cp /usr/local/bin/banner.sh /etc/profile.d/banner.sh \
 && chmod +x /etc/profile.d/banner.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]