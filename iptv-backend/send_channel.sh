#!/usr/bin/expect -f

set timeout 3

# Get arguments
set channel [lindex $argv 0]
set ip [lindex $argv 1]

set username "ctrl"
set password "labrador"

spawn telnet $ip

expect {
    "login:" { send "$username\r" }
    timeout { puts "Login prompt timeout"; exit 1 }
}

expect {
    "Password:" { send "$password\r" }
    timeout { puts "Password prompt timeout"; exit 1 }
}

sleep 0.5

foreach digit [split $channel ""] {
    send "^send:rm_$digit!\r"
    sleep 0.3
}

send "^send:rm_ok!\r"
sleep 0.5
send "exit\r"
expect eof

