import io from "socket.io-client";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "./high-jump.scss";

const client = (
  termElementId: string,
  shellUri: string,
  host: string,
  port: number,
  username: string,
  password: string
) => {
  const term = new Terminal({ cursorBlink: true });
  const terminalContainer = document.getElementById(termElementId)!;
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.open(terminalContainer!);
  term.focus();
  fitAddon.fit();

  const socket = io(shellUri).open();

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
      host,
      port,
      username,
      password,
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
};

export default client;
