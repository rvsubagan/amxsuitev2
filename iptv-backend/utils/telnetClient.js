const net = require('net');

class TelnetClient {
  constructor({
    host,
    port = 23,
    timeout = 5000
  }) {
    this.host = host;
    this.port = port;
    this.timeout = timeout;

    this.socket = null;
    this.buffer = '';
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = new net.Socket();

      let settled = false;

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;

          this.socket.destroy();

          reject(
            new Error('Telnet connection timeout')
          );
        }
      }, this.timeout);

      this.socket.on('connect', () => {
        if (!settled) {
          settled = true;

          clearTimeout(timer);

          resolve();
        }
      });

      this.socket.on('data', (data) => {
        this.handleTelnetNegotiation(data);
      });

      this.socket.on('error', (error) => {
        if (!settled) {
          settled = true;

          clearTimeout(timer);

          reject(error);
        }
      });

      this.socket.connect(
        this.port,
        this.host
      );
    });
  }

  handleTelnetNegotiation(data) {
    const bytes = Buffer.from(data);

    const output = [];

    let i = 0;

    while (i < bytes.length) {

      // Telnet IAC
      if (bytes[i] === 255) {

        if (i + 1 >= bytes.length) {
          break;
        }

        const command = bytes[i + 1];

        // IAC IAC = literal 255
        if (command === 255) {
          output.push(255);

          i += 2;

          continue;
        }

        // WILL / WONT / DO / DONT
        if (
          command === 251 ||
          command === 252 ||
          command === 253 ||
          command === 254
        ) {

          if (i + 2 >= bytes.length) {
            break;
          }

          const option = bytes[i + 2];

          let response;

          // WILL / WONT -> DONT
          if (
            command === 251 ||
            command === 252
          ) {
            response = Buffer.from([
              255,
              254,
              option
            ]);
          }

          // DO / DONT -> WONT
          else {
            response = Buffer.from([
              255,
              252,
              option
            ]);
          }

          this.socket.write(response);

          i += 3;

          continue;
        }

        // Other Telnet commands
        i += 2;

        continue;
      }

      output.push(bytes[i]);

      i++;
    }

    if (output.length > 0) {
      this.buffer += Buffer
        .from(output)
        .toString('utf8');
    }
  }

  waitFor(pattern, timeout = this.timeout) {
    return new Promise((resolve, reject) => {

      const start = Date.now();

      const check = () => {

        if (pattern.test(this.buffer)) {
          resolve(this.buffer);

          return;
        }

        if (Date.now() - start >= timeout) {
          reject(
            new Error(
              `Timeout waiting for ${pattern.toString()}`
            )
          );

          return;
        }

        setTimeout(check, 50);
      };

      check();
    });
  }

  send(data) {
    if (
      !this.socket ||
      this.socket.destroyed
    ) {
      throw new Error(
        'Telnet connection is not open'
      );
    }

    this.socket.write(data);
  }

  close() {
    if (
      this.socket &&
      !this.socket.destroyed
    ) {
      this.socket.end();
      this.socket.destroy();
    }
  }
}

module.exports = TelnetClient;