#!/bin/bash

set -e

# Terminal aesthetics loading
echo "Starting system..." | lolcat -a -d 2 || echo "Starting system..."
figlet "Forti-Router" | lolcat || echo "Forti-Router"

hostname ${TAILSCALE_HOSTNAME:-forti-router}

echo "Checking for Tailscale updates..."
tailscale update --yes || echo "Tailscale update check failed, proceeding..."

cat <<EOF > /etc/resolv.conf
nameserver 8.8.8.8
nameserver 8.8.4.4
nameserver 1.1.1.1
nameserver 1.0.0.1
EOF

sysctl -w net.ipv4.ip_forward=1

# ensure PPP device exists
if [ ! -e /dev/ppp ]; then
  echo "Creating /dev/ppp device"
  mknod /dev/ppp c 108 0 || true
fi

# SSH Passwordless Support
if [ -n "$SSH_PUBLIC_KEY" ]; then
  echo "Configuring SSH Authorized Keys..."
  mkdir -p /root/.ssh
  echo "$SSH_PUBLIC_KEY" >> /root/.ssh/authorized_keys
  chmod 600 /root/.ssh/authorized_keys
fi

#################################
# Generate FortiVPN config
#################################

cat <<EOF > /tmp/fortivpn.conf
host = ${FORTI_HOST}
port = ${FORTI_PORT}
username = ${FORTI_USERNAME}
password = ${FORTI_PASSWORD}
trusted-cert = ${FORTI_CERT}
set-routes = 1
pppd-use-peerdns = 1
EOF

#################################
# Start tailscaled
#################################

echo "Starting tailscaled..."

mkdir -p /var/lib/tailscale

tailscaled \
 --state=/var/lib/tailscale/tailscaled.state \
 --socket=/run/tailscale/tailscaled.sock &

sleep 5

echo "Connecting to Tailscale..."

# Build Tailscale arguments dynamically
TS_ARGS="--hostname=${TAILSCALE_HOSTNAME:-forti-exit-node} --advertise-exit-node --accept-dns=false --accept-routes"

if [ -n "$TAILSCALE_SUBNETS" ]; then
    TS_ARGS="$TS_ARGS --advertise-routes=$TAILSCALE_SUBNETS"
fi

if [ -n "$TAILSCALE_TAGS" ]; then
    TS_ARGS="$TS_ARGS --advertise-tags=$TAILSCALE_TAGS"
fi

if [ "${TAILSCALE_SSH:-true}" = "true" ]; then
    TS_ARGS="$TS_ARGS --ssh"
fi

# Check if state exists to avoid requiring authkey on restart
if [ -f "/var/lib/tailscale/tailscaled.state" ] && [ -s "/var/lib/tailscale/tailscaled.state" ]; then
    echo "Restoring existing Tailscale connection..."
    tailscale up $TS_ARGS || tailscale up --authkey=${TAILSCALE_AUTHKEY} $TS_ARGS
else
    echo "Initial Tailscale connection..."
    tailscale up --authkey=${TAILSCALE_AUTHKEY} $TS_ARGS
fi

#################################
# Start VPN monitor
#################################

echo "Starting VPN monitor..."

/vpn-monitor.sh &

#################################
# Enable routing between Tailscale and VPN
#################################

echo "Configuring routing..."

iptables -t nat -A POSTROUTING -o ppp0 -j MASQUERADE || true
iptables -A FORWARD -i tailscale0 -o ppp0 -j ACCEPT || true
iptables -A FORWARD -i ppp0 -o tailscale0 -m state --state RELATED,ESTABLISHED -j ACCEPT || true

#################################
# Start dashboard
#################################

echo "Starting web dashboard..." | lolcat || echo "Starting web dashboard..."

node /app/server.js &

wait