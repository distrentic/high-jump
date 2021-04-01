import io from "socket.io-client";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "./main.scss";

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
