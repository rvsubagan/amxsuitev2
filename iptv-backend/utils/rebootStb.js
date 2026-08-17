const TelnetClient = require('./telnetClient');

async function rebootStb(ip) {

  // Credentials retained from original Expect script
  const username = 'admin';
  const password = 'labrador';

  const telnet = new TelnetClient({
    host: ip,
    port: 23,
    timeout: 5000
  });

  try {

    await telnet.connect();

    // Wait for login prompt
    await telnet.waitFor(
      /login:/i,
      5000
    );

    telnet.send(
      `${username}\r`
    );

    // Wait for password prompt
    await telnet.waitFor(
      /password:/i,
      5000
    );

    telnet.send(
      `${password}\r`
    );

    // Wait for menu
    await sleep(1000);

    // Select reboot option 9
    telnet.send(
      '9\r'
    );

    // Wait before confirmation
    await sleep(500);

    // Confirm reboot
    telnet.send(
      'yes\r'
    );

    // Allow device to begin rebooting
    await sleep(1000);

    telnet.close();

    return {
      success: true,
      ip
    };

  } catch (error) {

    telnet.close();

    throw error;
  }
}

function sleep(ms) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}

module.exports = rebootStb;