#!/bin/bash
 
set -e
 
IFACE="$(ip route list default | sed -E 's/^.*dev (\w+) .*$/\1/')"
 
cat <<EOF
 
Simulating packet loss on $IFACE ingress
Type numbers between 0-100 to set % of lost packets
Type \`exit\` or use Ctrl-C to exit
EOF
 
cleanup() {
        echo "Exiting..."
        tc qdisc del dev $IFACE ingress || true
        ip link del ifb0 || true
}
 
trap cleanup EXIT
 
modprobe ifb
ip link add ifb0 type ifb
ip link set dev ifb0 up
tc qdisc add dev $IFACE ingress
tc filter add dev $IFACE parent ffff: protocol ip u32 match u32 0 0 flowid 1:1 action mirred egress redirect dev ifb0
tc qdisc add dev ifb0 root netem loss 0%
 
CURRENT=0
while [ 0 ]; do
        echo ""
        echo "Current packet loss: $CURRENT%"
        echo -n "> "
        read INPUT
 
        case $INPUT in
                exit)
                        exit 0
                        ;;
 
                *)
                        UPDATED="$(echo $INPUT | sed -E -n 's/^ *0*([1-9]?[0-9]|100) *%? *$/\1/p')"
                        if [ -z "$UPDATED" ]; then
                                echo "Invalid packet loss (0-100): $INPUT"
                        else
                                CURRENT="$UPDATED"
                                tc qdisc change dev ifb0 root netem loss $CURRENT%
                        fi
                        ;;
        esac
done
