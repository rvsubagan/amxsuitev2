// lib/tcp.js

import net from "net"

/**
 * Check whether a TCP port is reachable.
 *
 * Returns true when the TCP connection succeeds.
 * Returns false on timeout, connection error, or any other failure.
 */
export function checkTcp(host, port, timeout = 2000) {
  return new Promise((resolve) => {
    const socket = new net.Socket()

    let finished = false

    const finish = (result) => {
      if (finished) return

      finished = true
      socket.destroy()
      resolve(result)
    }

    socket.setTimeout(timeout)

    socket.once("connect", () => {
      finish(true)
    })

    socket.once("timeout", () => {
      finish(false)
    })

    socket.once("error", () => {
      finish(false)
    })

    socket.connect(port, host)
  })
}