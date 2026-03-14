#!/bin/bash

set -e

echo "Starting Forti-Tailscale Exit Node..."

# enable forwarding
sysctl -w net.ipv4.ip_forward=1

# ensure PPP device exists
if [ ! -e /dev/ppp ]; then
  echo "Creating /dev/ppp device"
  mknod /dev/ppp c 108 0 || true
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

tailscale up \
  --authkey=${TAILSCALE_AUTHKEY} \
  --hostname=${TAILSCALE_HOSTNAME:-forti-exit-node} \
  --advertise-exit-node \
  --ssh \
  --accept-dns=false \
  --accept-routes=true

#################################
# Start VPN monitor
#################################

echo "Starting VPN monitor..."

/vpn-monitor.sh &

#################################
# Start dashboard
#################################

echo "Starting dashboard..."

python3 /dashboard.py &

wait