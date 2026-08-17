const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const https = require('https');

const rebootBox = require('./utils/rebootBox');
const sendChannel = require('./utils/sendChannel');
const rebootStb = require('./utils/rebootStb');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

// ==========================================
// Health Checks
// ==========================================

app.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ status: 'ready' });
});


// ==========================================
// Exterity Change Channel
// Replaces send_channel.sh
// ==========================================

app.post('/send-channels', async (req, res) => {
  const channels = req.body.channels;

  if (!Array.isArray(channels) || channels.length === 0) {
    return res.status(400).json({
      error: 'Expected a non-empty array of channels'
    });
  }

  const results = await Promise.all(
    channels.map(async ({ ip, channel }) => {
      try {
        await sendChannel(ip, channel);

        return {
          ip,
          channel,
          success: true
        };
      } catch (error) {
        return {
          ip,
          channel,
          success: false,
          error: error.message
        };
      }
    })
  );

  res.status(200).json({ results });
});


// ==========================================
// Vitec Change Channel
// ==========================================

const vitecHttpsAgent = new https.Agent({
  rejectUnauthorized: false
});

app.post('/send-channels2', async (req, res) => {
  const { ip, streamUri } = req.body;

  if (!ip || !streamUri) {
    return res.status(400).json({
      error: 'Missing ip or streamUri'
    });
  }

  try {
    const url = `https://${ip}:8080/display/stream-uri`;

    const authHeader =
      'Basic ' +
      Buffer.from('admin:vitec321').toString('base64');

    const response = await axios.put(
      url,
      {
        'stream-uri': streamUri
      },
      {
        httpsAgent: vitecHttpsAgent,

        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },

        timeout: 5000,
        validateStatus: () => true
      }
    );

    if (response.status >= 400) {
      return res.status(response.status).json({
        success: false,
        status: response.status,
        error: response.data
      });
    }

    res.json({
      success: true,
      message: 'Vitec channel changed successfully',
      data: response.data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// ==========================================
// Exterity STB Reboot
// Replaces stb_reboot.sh
// ==========================================

app.post('/reboot-stb', async (req, res) => {
  const { ip } = req.body;

  if (!ip) {
    return res.status(400).json({
      error: 'Missing STB IP address in request body.'
    });
  }

  try {
    await rebootStb(ip);

    return res.json({
      message: 'Reboot command sent successfully.'
    });

  } catch (error) {
    console.error(`STB reboot error: ${error.message}`);

    return res.status(500).json({
      error: 'Failed to execute reboot command',
      details: error.message
    });
  }
});


// ==========================================
// Alps1 Vitec Reboot Endpoint
// ==========================================

app.post('/api/reboot', async (req, res) => {
  const { ip } = req.body;

  if (!ip) {
    return res.status(400).json({
      error: 'Decoder IP is required.'
    });
  }

  try {
    const result = await rebootBox(ip);

    if (result.success) {
      return res.json({
        success: true,
        message: `Rebooted ${ip}`,
        status: result.status
      });
    }

    return res.status(500).json({
      error: `Failed to reboot ${ip}: ${result.error}`
    });

  } catch (error) {
    return res.status(500).json({
      error: `Failed to reboot ${ip}: ${error.message}`
    });
  }
});


// ==========================================
// Start Server
// ==========================================

app.listen(PORT, () => {
  console.log(
    `🚀 IPTV Backend running on http://0.0.0.0:${PORT}`
  );
});