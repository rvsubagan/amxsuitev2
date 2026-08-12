#!/usr/bin/expect -f

# Check for command-line argument
if { $argc != 1 } {
    puts "Usage: ./stb_reboot <IP_ADDRESS>"
    exit 1
}

# Set variables
set ip [lindex $argv 0]
set timeout 5
set username "admin"
set password "labrador"

# Start telnet session
spawn telnet $ip

expect {
    "login:" { send "$username\r" }
    timeout { puts "Login prompt timeout"; exit 1 }
}

expect {
    "Password:" { send "$password\r" }
    timeout { puts "Password prompt timeout"; exit 1 }
}

# Wait for menu to appear
sleep 1

# Select option 9 (Reboot)
send "9\r"

# Wait briefly, then send "yes"
sleep 0.5
send "yes\r"

# Optional: wait for device to start rebooting
sleep 1

expect eof
