const { execFile } = require("child_process")

function pingHost(host) {
  return new Promise((resolve) => {
    execFile(
      "ping",
      ["-c", "1", "-W", "2", host],
      (error) => {
        resolve(!error)
      }
    )
  })
}

module.exports = {
  pingHost,
}