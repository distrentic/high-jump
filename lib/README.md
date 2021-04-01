# high-jump (library)

An SSH jump server library using `ssh2` and `socket.io`.

## Installation

```sh
npm install @distrentic/high-jump
```

```sh
yarn add @distrentic/high-jump
```

## Usage

You can either run ready-to-use [`high-jump-server`](../server) or implement your own server using this library.

### Express server example (typescript)

```typescript
import express from "express";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import shell from "@distrentic/high-jump";

const PORT = process.env["PORT"] || 8022;

const log = console;

const app = express();
const server = new HttpServer(app);
const io = new SocketServer(server, {
  serveClient: false,
  path: "/ssh",
  cors: { origin: "*" },
});

io.on("connection", (socket) => shell(socket, log));

server.listen(PORT, () => {
  log.info(`high-jump is running at ::${PORT}`);
});
```

### Client example (typescript)

```typescript
import io from "socket.io-client";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

const term = new Terminal({ cursorBlink: true });
const terminalContainer = document.getElementById("terminal-container")!;
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.open(terminalContainer);
term.focus();
fitAddon.fit();

const socket = io("http://localhost:8022/", { path: "/ssh" }).open();

window.addEventListener("resize", resize, false);

function resize() {
  fitAddon.fit();
  socket.emit("resize", {
    cols: term.cols,
    rows: term.rows,
    width: terminalContainer.clientWidth,
    height: terminalContainer.clientHeight,
  });
}

socket.on("connect", () => {
  socket.emit("shell", {
    host: "",
    port: 22,
    username: "",
    password: "",
    cols: term.cols,
    rows: term.rows,
    width: terminalContainer.clientWidth,
    height: terminalContainer.clientHeight,
  });
});

term.onData((data: string) => {
  socket.emit("data", data);
});

socket.on("data", (data: ArrayBuffer) => {
  term.write(new TextDecoder().decode(data));
});

socket.on("shell_error", (type: string) => {
  alert(type);
});
```

## API

`require('@distrentic/high-jump)` returns a function to construct the shell socket listener.

### Methods

- **shell**(< _Socket_ > socket, < _Logger_ > logger) - (_void_) - Constructs the shell socket listener.
  - **socket** - _Socket_ - `socket.io` connection handler.
  - **logger** - _Logger_ - An instance of a logging library. Accepts `console`, `winston.Logger`, `bunyan.Logger`, etc.

### Events

#### Emitted events

These are the

- **data**(< _ArrayBuffer_ > data) - `UTF-8` encoded buffer.
- **shell_error** - < _"SSH_CONNECTION_ERROR" | "SSH_AUTHENTICATION_ERROR" | "SHELL_ERROR" | "SOCKET_ERROR"_ > error) - Emitted when an error occurs. Message received indicates the type of error.

#### Listened events

- **shell**(< object > config) - Client emitted event to request a new shell. You can either authenticate with a `password` or a `privateKey` (and a `passphrase` if you set one).

```json
{
  "host": "",
  "port": 22,
  "username": "",
  "password": "P@ssw0rd",
  "privateKey": "",
  "passphrase": "",

  // pseudo tty configuration
  "cols": 80,
  "rows": 60,
  "width": 1600,
  "height": 1200
}
```

- **data**(< _string_ > data) - Sends data to remote shell.
- **resize**(< _object_ > config) - Event to resize pseudo tty.

```json
{
  "cols": 80,
  "rows": 60,
  "width": 1600,
  "height": 1200
}
```

## License

Licensed under MIT license ([LICENSE](../LICENSE) or <http://opensource.org/licenses/MIT>)
