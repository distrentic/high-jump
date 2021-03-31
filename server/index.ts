import express from "express";
import path from "path";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import log from "./log";
import shell from "./shell";

const PORT = 8080;
const app = express();
const server = new HttpServer(app);
const io = new SocketServer(server, { serveClient: false, path: "/ssh" });

const publicPath = path.join(__dirname, "public");

app.use(express.static(publicPath));

app.get("/", (req, res) => res.send("high-jump: Web SSH backend"));

app.use(
  "/connect",
  express.static(publicPath, { extensions: ["htm", "html"] })
);

io.on("connection", (socket) => shell(socket, log));

app.get("/connect/host", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

server.listen(PORT, () => {
  log.info(`high-jump is running at https://localhost:${PORT}`);
});