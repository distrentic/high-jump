import express from "express";
import path from "path";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import shell from "./shell";

const PORT = 8080;
const app = express();
const server = new HttpServer(app);
const io = new SocketServer(server, { serveClient: false, path: "/ssh" });

const publicPath = path.join(__dirname, "public");

app.use(express.static(publicPath));

app.get("/", (req, res) => res.send("Express + TypeScript Server"));

app.use(
  "/connect",
  express.static(publicPath, { extensions: ["htm", "html"] })
);

io.on("connection", shell);

io.on("connection", () => {
  console.log("a user connected");
});

app.get("/connect/host", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

server.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
