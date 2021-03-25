import io from "socket.io-client";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

const term = new Terminal({ cursorBlink: true });
const terminalContainer = document.getElementById("terminal-container");
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.open(terminalContainer!);
term.focus();
fitAddon.fit();

const socket = io({ path: "/ssh" }).open();

window.addEventListener("resize", resize, false);

function resize() {
  fitAddon.fit();
  socket.emit("resize", {
    cols: term.cols,
    rows: term.rows,
    width: term.cols,
    height: term.rows,
  });
}

term.onData((data: string) => {
  socket.emit("data", data);
});

socket.on("data", (data: ArrayBuffer) => {
  term.write(new TextDecoder().decode(data));
});
