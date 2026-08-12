const snmp = require("net-snmp")

const DECODER_IP = "172.18.90.186"
const COMMUNITY = "public"

const OIDS = {
  stream: "1.3.6.1.4.1.41639.1.1.25.0",
  streamAudio: "1.3.6.1.4.1.41639.1.1.26.0",
  dviStatus: "1.3.6.1.4.1.41639.1.1.30.0",
  multicast: "1.3.6.1.4.1.41639.1.1.45.0",
  ip: "1.3.6.1.4.1.41639.1.1.4.0",

  videoDrop: "1.3.6.1.4.1.41639.1.1.40.0",
  frameDrop: "1.3.6.1.4.1.41639.1.1.42.0",
}

function getDecoderStatus() {
  return new Promise((resolve, reject) => {
    const session = snmp.createSession(
      DECODER_IP,
      COMMUNITY,
      {
        port: 161,
        timeout: 3000,
        retries: 1,
      }
    )

    const oids = [
      OIDS.stream,
      OIDS.streamAudio,
      OIDS.dviStatus,
      OIDS.multicast,
      OIDS.ip,
      OIDS.videoDrop,
      OIDS.frameDrop,
    ]

    session.get(oids, (error, varbinds) => {
      session.close()

      if (error) {
        reject(error)
        return
      }

      const values = {}

      varbinds.forEach((vb) => {
        values[vb.oid] = vb.value
      })

      resolve({
        ip: String(
          values[OIDS.ip] || DECODER_IP
        ),

        stream: Number(
          values[OIDS.stream] || 0
        ),

        streamAudio: Number(
          values[OIDS.streamAudio] || 0
        ),

        hdmi: String(
          values[OIDS.dviStatus] || "unknown"
        ),

        multicast: String(
          values[OIDS.multicast] || "-"
        ),

        videoDrop: Number(
          values[OIDS.videoDrop] || 0
        ),

        frameDrop: Number(
          values[OIDS.frameDrop] || 0
        ),
      })
    })
  })
}

module.exports = {
  getDecoderStatus,
}