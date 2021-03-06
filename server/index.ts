import express from "express";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import log from "./log";
import shell from "high-jump";

const PORT = process.env["PORT"] || 8022;

const app = express();
const server = new HttpServer(app);
const io = new SocketServer(server, {
  serveClient: false,
  path: "/ssh",
  cors: { origin: "*" },
});

app.get("/", (req, res) => res.send("high-jump: Web SSH backend"));

io.on("connection", (socket) => shell(socket, log));

server.listen(PORT, () => {
  log.info(`high-jump is running at ::${PORT}`);
});

const signals = ["SIGTERM", "SIGINT"];

signals.forEach((signal) =>
  process.on(signal, () => {
    log.info("high-jump is shutting down!!!");
    io.close();
    server.close();
  })
);
