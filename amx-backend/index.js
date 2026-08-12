const express = require('express');
const cors = require('cors');
const net = require('net');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

// Alps 1 Controller
const CONTROLLER_IP = '172.18.92.101';
const CONTROLLER_PORT = 50020;

// Alps 2 Controller
const CONTROLLER2_IP = '172.18.90.201';
const CONTROLLER2_PORT = 50020;

// Alps1 Switch
app.post('/api/switch', (req, res) => {
  const { streamNumber, decoderIp } = req.body;

  if (!streamNumber || streamNumber < 201 || streamNumber > 249) {
    return res.status(400).json({ error: 'Stream number must be between 201 and 249.' });
  }

  if (!decoderIp) {
    return res.status(400).json({ error: 'Decoder IP is required.' });
  }

  const command = `switch ${decoderIp} ${streamNumber}\r\n`;
  const client = new net.Socket();
  let responded = false;

  client.setTimeout(3000);

  client.connect(CONTROLLER_PORT, CONTROLLER_IP, () => {
    client.write(command, () => {
      
      responded = true;
      res.json({
        success: true,
        message: `Switched ${decoderIp} to stream ${streamNumber}`
      });

      client.end();
      client.destroy();
    });
  });

  client.on('timeout', () => {
    if (!responded) {
      res.status(504).json({ error: 'Controller timeout' });
    }
    client.destroy();
  });

  client.on('error', (err) => {
    if (!responded) {
      res.status(500).json({ error: err.message });
    }
    client.destroy();
  });
});

// CC AMX Switch with Audio Routing
app.post('/api/switch2', (req, res) => {
  const { streamNumber, decoderIp } = req.body;

  if (!decoderIp) {
    return res.status(400).json({ error: 'Decoder IP is required.' });
  }

  if (!streamNumber) {
    return res.status(400).json({ error: 'Stream number is required.' });
  }

  if (streamNumber < 101 || streamNumber > 171) {
    return res.status(400).json({
      error: 'Stream number must be between 101 and 171.'
    });
  }

  // 🔊 AUDIO OVERRIDE RULES
  const audioOverrides = {
    136: 101,
    137: 105,
    138: 109,
    139: 113,
    140: 101
  };

  const client = new net.Socket();
  let responded = false;

  client.setTimeout(3000);

  client.connect(CONTROLLER2_PORT, CONTROLLER2_IP, () => {
    // 🎥 VIDEO COMMAND
    const videoCommand = `switch ${decoderIp} ${streamNumber}\r\n`;

    client.write(videoCommand, () => {

      // 🔊 APPLY OVERRIDE (or default to same stream)
      const audioStream = audioOverrides[streamNumber] || streamNumber;
      const audioCommand = `switchaudio ${decoderIp} ${audioStream}\r\n`;

      client.write(audioCommand, () => {
        responded = true;

        res.json({
          success: true,
          message: `Video → ${streamNumber}, Audio → ${audioStream} on ${decoderIp}`
        });

        client.end();
        client.destroy();
      });

    });
  });

  client.on('timeout', () => {
    if (!responded) {
      res.status(504).json({ error: 'Controller timeout' });
    }
    client.destroy();
  });

  client.on('error', (err) => {
    if (!responded) {
      res.status(500).json({ error: err.message });
    }
    client.destroy();
  });
});

// CC AMX Audio Route - Separate endpoint to allow audio-only switching without affecting video stream
app.post('/api/switchAudioOnly', (req, res) => {
  const { streamNumber, decoderIp } = req.body;

  if (!decoderIp) {
    return res.status(400).json({ error: 'Decoder IP is required.' });
  }

  if (!streamNumber) {
    return res.status(400).json({ error: 'Stream number is required.' });
  }

  // 🎯 Limit to your 16-button range
  if (streamNumber < 101 || streamNumber > 116) {
    return res.status(400).json({
      error: 'Audio stream must be between 101 and 116.'
    });
  }

  const client = new net.Socket();
  let responded = false;

  client.setTimeout(3000);

  client.connect(CONTROLLER2_PORT, CONTROLLER2_IP, () => {
    const audioCommand = `switchaudio ${decoderIp} ${streamNumber}\r\n`;

    client.write(audioCommand, () => {
      responded = true;

      res.json({
        success: true,
        message: `Audio switched to stream ${streamNumber} on ${decoderIp}`
      });

      client.end();
      client.destroy();
    });
  });

  client.on('timeout', () => {
    if (!responded) {
      res.status(504).json({ error: 'Controller timeout' });
    }
    client.destroy();
  });

  client.on('error', (err) => {
    if (!responded) {
      res.status(500).json({ error: err.message });
    }
    client.destroy();
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AMX Backend running at http://0.0.0.0:${PORT}`);
});
