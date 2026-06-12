#!/bin/bash

get_ping_target() {
    if [ -f "/var/lib/tailscale/config.json" ]; then
        VAL=$(grep -o '"pingTarget"\s*:\s*"[^"]*"' /var/lib/tailscale/config.json | cut -d'"' -f4)
        if [ -n "$VAL" ]; then
            echo "$VAL"
            return
        fi
    fi
    echo "${PING_TARGET:-8.8.8.8}"
}

FAIL_COUNT=0

while true
do

if [ -f "/tmp/vpn_stopped" ]; then
    sleep 5
    continue
fi

PING_TARGET=$(get_ping_target)

if ! ip addr | grep -q ppp0
then
    echo "[VPN] Not connected. Reconnecting..."
    openfortivpn -c /tmp/fortivpn.conf &
    sleep 10
    FAIL_COUNT=0
else
    if ! ping -c 1 -W 2 -I ppp0 $PING_TARGET >/dev/null 2>&1; then
        FAIL_COUNT=$((FAIL_COUNT+1))
        echo "[VPN] Ping failed to $PING_TARGET ($FAIL_COUNT/3)"
        
        if [ "$FAIL_COUNT" -ge 3 ]; then
            echo "[VPN] Connection stalled. Restarting..."
            killall openfortivpn || true
            sleep 2
        fi
    else
        FAIL_COUNT=0
    fi
fi

sleep 15

done