const axios = require('axios');
const https = require('https');

const username = 'admin';
const password = 'vitec321';

async function rebootBox(ip) {
  const url = `https://${ip}:8080/reboot`;

  const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    auth: { username, password },
    headers: { 'Content-Type': 'application/json' },
  });

  try {
    const response = await axiosInstance.post(url);
    return { success: true, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = rebootBox;
