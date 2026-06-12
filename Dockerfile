FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    iproute2 \
    iputils-ping \
    iptables \
    openfortivpn \
    nodejs \
    npm \
    procps \
    ca-certificates \
    nano \
    cowsay \
    lolcat \
    figlet \
    ppp \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://tailscale.com/install.sh | sh

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY entrypoint.sh /entrypoint.sh
COPY vpn-monitor.sh /vpn-monitor.sh
COPY server.js /server.js
COPY banner.sh /usr/local/bin/banner.sh
COPY web/dist /app/web/

RUN chmod +x /entrypoint.sh \
 && chmod +x /vpn-monitor.sh \
 && chmod +x /usr/local/bin/banner.sh \
 && chmod -x /etc/update-motd.d/*

RUN cp /usr/local/bin/banner.sh /etc/profile.d/banner.sh \
 && chmod +x /etc/profile.d/banner.sh

RUN rm -f /etc/motd \
 && rm -f /etc/legal \
 && sed -i 's/^PrintMotd yes/PrintMotd no/' /etc/ssh/sshd_config || true \
 && sed -i 's/^PrintLastLog yes/PrintLastLog no/' /etc/ssh/sshd_config || true

EXPOSE 80 443

ENTRYPOINT ["/entrypoint.sh"]