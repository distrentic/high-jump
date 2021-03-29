import { Socket } from "socket.io";
import * as winston from "winston";
import ssh2 from "ssh2";

interface ShellConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

interface TermConfig {
  rows: number;
  cols: number;
  height: number;
  width: number;
}

type ShellRequest = ShellConfig & TermConfig;

const shell = (socket: Socket, log: winston.Logger) => {
  const session = new ssh2.Client();
  let shellConfig: ShellConfig;
  let termConfig: TermConfig;

  socket.on("shell", (req: ShellRequest) => {
    log.info("shell requested for %s:%d", req.host, req.port);

    shellConfig = req;
    termConfig = req;

    session.connect({
      host: req.host,
      port: req.port,
      username: req.username,
      password: req.password,
      tryKeyboard: true,
    });
  });

  session.on("banner", (data) => {
    log.debug("banner sent by %s:%d", shellConfig.host, shellConfig.port);
    // need to convert to cr/lf for proper formatting
    data = data.replace(/\r?\n/g, "\r\n");
    socket.emit("data", Buffer.from(data, "utf-8"));
  });

  session.on("ready", () => {
    log.info("shell is ready for %s:%d", shellConfig.host, shellConfig.port);

    session.shell(
      {
        term: "xterm-color",
        rows: termConfig.rows,
        cols: termConfig.cols,
        height: termConfig.height,
        width: termConfig.width,
      },
      (err, stream) => {
        if (err) throw err;

        socket.on("data", (data: string) => {
          stream.write(data);
        });

        socket.on(
          "resize",
          (data: {
            rows: number;
            cols: number;
            height: number;
            width: number;
          }) => {
            stream.setWindow(data.rows, data.cols, data.height, data.width);
          }
        );

        socket.on("disconnecting", (reason) => {
          log.debug("client disconnecting with reason '%s'", reason);
        });

        socket.on("disconnect", (reason) => {
          log.debug("client disconnected with reason '%s'", reason);
          session.end();
        });

        socket.on("error", (err) => {
          log.error("client connection error");
          log.error(err);
          session.end();
        });

        stream.on("data", (data: string) => {
          socket.emit("data", Buffer.from(data, "utf-8"));
        });

        stream.on("close", (code?: number, signal?: string) => {
          log.debug(
            "connection closed. exit code: %s, signal: %s",
            code,
            signal
          );
          session.end();
        });

        stream.stderr.on("data", (err) => {
          log.error("shell error");
          log.error(err);
        });
      }
    );
  });

  session.on("end", () => {
    log.debug("connection end by host");
  });

  session.on("close", (hadError) => {
    log.info("connection closed %s", hadError ? "with error" : "without error");
  });

  session.on("error", (err) => {
    log.error("connection error");
    log.error(err);
  });

  session.on(
    "keyboard-interactive",
    (name, instructions, instructionsLang, prompts, finish) => {
      log.debug("conn.on('keyboard-interactive')");
      finish(["password"]);
    }
  );
};

export default shell;
