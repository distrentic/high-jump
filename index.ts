import express from "express";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import shell from "./shell";

const PORT = 8080;
const app = express();
const server = new HttpServer(app);
const io = new SocketServer(server, { serveClient: false, path: "/ssh" });


app.get("/", (req, res) => res.send("Express + TypeScript Server"));

io.on("connection", shell);

io.on("connection", (socket: any) => {
  console.log("a user connected");
});

server.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
