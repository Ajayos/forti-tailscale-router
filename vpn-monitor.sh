#!/bin/bash

while true
do

if ! ip addr | grep -q ppp0
then
    echo "[VPN] Not connected. Reconnecting..."
    openfortivpn -c /tmp/fortivpn.conf &
    sleep 10
else
    echo "[VPN] Connected."
fi

sleep 15

done