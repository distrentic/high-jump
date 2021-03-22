import express from "express";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";

const PORT = 8080;
const app = express();
const server = new HttpServer(app);
const io = new SocketServer(server);

app.get("/", (req, res) => res.send("Express + TypeScript Server"));

io.on("connection", function (socket: any) {
  console.log("a user connected");
});

server.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
