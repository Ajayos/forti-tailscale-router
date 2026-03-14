#!/bin/bash

[ -z "$PS1" ] && return

RED="\e[31m"
GREEN="\e[32m"
CYAN="\e[36m"
YELLOW="\e[33m"
RESET="\e[0m"

echo -e "${CYAN}"
echo "==========================================="
echo "        Forti-Tailscale Router Node"
echo "==========================================="
echo -e "${RESET}"

echo -e "${YELLOW}Hostname:${RESET} $(hostname)"
echo -e "${YELLOW}Uptime:${RESET} $(uptime -p)"

if ip addr | grep -q ppp0; then
    echo -e "${GREEN}VPN: Connected${RESET}"
else
    echo -e "${RED}VPN: Disconnected${RESET}"
fi

TSIP=$(tailscale ip -4 2>/dev/null)

if [ -n "$TSIP" ]; then
    echo -e "${CYAN}Tailscale IP:${RESET} $TSIP"
fi

echo ""