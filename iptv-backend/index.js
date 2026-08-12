const express = require('express');
const bodyParser = require('body-parser');
const { execFile } = require('child_process');
const path = require('path');
const cors = require('cors');
const axios = require("axios");
const https = require("https");
const rebootBox = require('./utils/rebootBox');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

// Exterity Change Channel Script (send_channel.sh)
app.post('/send-channels', async (req, res) => {
  const channels = req.body.channels;

  if (!Array.isArray(channels) || channels.length === 0) {
    return res.status(400).json({ error: 'Expected a non-empty array of channels' });
  }

  // Path to your expect script
  const scriptPath = path.join(__dirname, 'send_channel.sh');

  // Run all commands in parallel and collect results
  const results = await Promise.all(
    channels.map(({ ip, channel }) => {
      return new Promise((resolve) => {
        execFile(scriptPath, [channel.toString(), ip], { timeout: 15000 }, (error, stdout, stderr) => {
          if (error) {
            resolve({ ip, channel, success: false, error: error.message });
          } else {
            resolve({ ip, channel, success: true, output: stdout.trim() });
          }
        });
      });
    })
  );

  res.status(200).json({ results });
});

// Vitec Change Channel
const vitecHttpsAgent = new https.Agent({
  rejectUnauthorized: false, // equivalent to curl -k
});

app.post("/send-channels2", async (req, res) => {
  const { ip, streamUri } = req.body;

  if (!ip || !streamUri) {
    return res.status(400).json({
      error: "Missing ip or streamUri",
    });
  }

  try {
    const url = `https://${ip}:8080/display/stream-uri`;

    const authHeader =
      "Basic " + Buffer.from("admin:vitec321").toString("base64");

    const response = await axios.put(
      url,
      {
        "stream-uri": streamUri,
      },
      {
        httpsAgent: vitecHttpsAgent,

        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader,
        },

        timeout: 5000,
        validateStatus: () => true, // important for debugging
      }
    );

    if (response.status >= 400) {
      return res.status(response.status).json({
        success: false,
        status: response.status,
        error: response.data,
      });
    }

    res.json({
      success: true,
      message: "Vitec channel changed successfully",
      data: response.data,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Exterity Reboot Script (stb_reboot.sh)
app.post('/reboot-stb', (req, res) => {
    const ip = req.body.ip;

    if (!ip) {
        return res.status(400).json({ error: 'Missing STB IP address in request body.' });
    }

    const scriptPath = path.join(__dirname, 'stb_reboot.sh');

    execFile(scriptPath, [ip], (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: 'Failed to execute script', details: stderr });
        }

        return res.json({ message: 'Reboot command sent successfully.', output: stdout });
    });
});

// Alps1 Vitec Reboot Endpoint
app.post('/api/reboot', async (req, res) => {
  const { ip } = req.body;

  if (!ip) {
    return res.status(400).json({ error: 'Decoder IP is required.' });
  }

  const result = await rebootBox(ip);

  if (result.success) {
    res.json({ success: true, message: `Rebooted ${ip}`, status: result.status });
  } else {
    res.status(500).json({ error: `Failed to reboot ${ip}: ${result.error}` });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 IPTV Backend running on http://0.0.0.0:${PORT}`);
});
