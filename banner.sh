#!/bin/bash

[ -z "$PS1" ] && return

RED="\e[31m"
GREEN="\e[32m"
CYAN="\e[36m"
YELLOW="\e[33m"
MAGENTA="\e[35m"
RESET="\e[0m"

clear
echo ""
echo "🚀 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 🚀" | lolcat
echo ""
figlet -f slant " Forti-Tailscale " | lolcat
figlet -f slant "     Router      " | lolcat
echo ""
echo "🚀 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 🚀" | lolcat
echo ""

cowsay -f dragon "Welcome to the Forti-Tailscale Gateway Terminal" | lolcat
echo ""

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}║${RESET} ${YELLOW}Hostname:${RESET}     $(hostname)"
echo -e "${CYAN}║${RESET} ${YELLOW}Uptime:${RESET}       $(uptime -p)"

if ip addr | grep -q ppp0; then
    echo -e "${CYAN}║${RESET} ${GREEN}VPN Status:${RESET}   Connected (ppp0 active)"
else
    if [ -f "/tmp/vpn_stopped" ]; then
        echo -e "${CYAN}║${RESET} ${RED}VPN Status:${RESET}   Stopped (Manually Disabled)"
    else
        echo -e "${CYAN}║${RESET} ${RED}VPN Status:${RESET}   Disconnected (Reconnecting...)"
    fi
fi

TSIP=$(tailscale ip -4 2>/dev/null)

if [ -n "$TSIP" ]; then
    echo -e "${CYAN}║${RESET} ${MAGENTA}Tailscale IP:${RESET} $TSIP"
    echo -e "${CYAN}║${RESET} ${GREEN}Web UI:${RESET}       http://$TSIP"
else
    echo -e "${CYAN}║${RESET} ${RED}Tailscale:${RESET}    Not Connected"
    echo -e "${CYAN}║${RESET} ${GREEN}Web UI:${RESET}       http://<host-ip>"
fi

echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${RESET}"
echo ""
echo "Type 'tailscale status' to see peers, or visit the Web UI for configuration."
echo ""