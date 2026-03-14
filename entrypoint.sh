#!/bin/bash

set -e

echo "Starting system..."

sysctl -w net.ipv4.ip_forward=1

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
# Start Tailscale
#################################

echo "Starting tailscaled..."

tailscaled --state=/tmp/tailscale.state &

sleep 3

tailscale up \
  --authkey=${TAILSCALE_AUTHKEY} \
  --hostname=${TAILSCALE_HOSTNAME} \
  --advertise-exit-node

#################################
# Start VPN Monitor
#################################

echo "Starting VPN monitor..."

/vpn-monitor.sh &

#################################
# Start dashboard
#################################

echo "Starting dashboard..."

python3 /dashboard.py &

wait