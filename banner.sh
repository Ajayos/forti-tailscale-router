#!/bin/bash

[ -z "$PS1" ] && return

RED="\e[31m"
GREEN="\e[32m"
CYAN="\e[36m"
YELLOW="\e[33m"
MAGENTA="\e[35m"
RESET="\e[0m"

echo ""
figlet "AOS" | lolcat
echo ""
cowsay -f tux "Forti-Tailscale Router Exit Node" | lolcat
echo ""
echo -e "${CYAN}┌──────────────────────────────────────────┐"
echo -e "│        Forti-Tailscale Router Node       │"
echo -e "└──────────────────────────────────────────┘${RESET}"
echo ""
echo -e "${YELLOW}Hostname:${RESET} $(hostname)"
echo -e "${YELLOW}Uptime:${RESET} $(uptime -p)"

if ip addr | grep -q ppp0; then
    echo -e "${GREEN}VPN Status:${RESET} Connected"
else
    echo -e "${RED}VPN Status:${RESET} Disconnected"
fi

TSIP=$(tailscale ip -4 2>/dev/null)

if [ -n "$TSIP" ]; then
    echo -e "${MAGENTA}Tailscale IP:${RESET} $TSIP"
else
    echo -e "${RED}Tailscale:${RESET} Not Connected"
fi
echo ""
echo -e "${CYAN}Dashboard:${RESET} http://$TSIP:8080"
echo ""
echo "════════════════════════════════════════════" | lolcat
echo ""