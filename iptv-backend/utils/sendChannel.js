const TelnetClient = require('./telnetClient');

async function sendChannel(ip, channel) {

  // Credentials retained from original Expect script
  const username = 'ctrl';
  const password = 'labrador';

  const telnet = new TelnetClient({
    host: ip,
    port: 23,
    timeout: 3000
  });

  try {

    await telnet.connect();

    // Wait for login prompt
    await telnet.waitFor(
      /login:/i,
      3000
    );

    telnet.send(
      `${username}\r`
    );

    // Wait for password prompt
    await telnet.waitFor(
      /password:/i,
      3000
    );

    telnet.send(
      `${password}\r`
    );

    // Same delay as original Expect script
    await sleep(500);

    // Send each digit individually
    for (
      const digit of String(channel).split('')
    ) {

      telnet.send(
        `^send:rm_${digit}!\r`
      );

      await sleep(300);
    }

    // Send OK command
    telnet.send(
      '^send:rm_ok!\r'
    );

    await sleep(500);

    // Exit Telnet session
    telnet.send(
      'exit\r'
    );

    telnet.close();

    return {
      success: true,
      ip,
      channel
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

module.exports = sendChannel;