import { Socket } from "socket.io";
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

const shell = (socket: Socket) => {
  const session = new ssh2.Client();
  let shellConfig: ShellConfig;
  let termConfig: TermConfig;

  socket.on("shell", (req: ShellRequest) => {
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
    // need to convert to cr/lf for proper formatting
    data = data.replace(/\r?\n/g, "\r\n");
    socket.emit("data", Buffer.from(data, "utf-8"));
  });

  session.on("ready", () => {
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
          console.log(reason);
        });

        socket.on("disconnect", (reason) => {
          console.log(reason);
          session.end();
        });

        socket.on("error", (err) => {
          console.log(err);
          session.end();
        });

        stream.on("data", (data: any) => {
          socket.emit("data", Buffer.from(data, "utf-8"));
        });

        stream.on("close", (code: any, signal: any) => {
          console.log(code, signal);
          session.end();
        });

        stream.stderr.on("data", (data) => {
          console.log("STDERR: " + data);
        });
      }
    );
  });

  session.on("end", (err: any) => {
    console.log("CONN END BY HOST", err);
  });
  session.on("close", (err) => {
    console.log("CONN CLOSE", err);
  });
  session.on("error", (err) => {
    console.log("CONN ERROR", err);
  });

  session.on(
    "keyboard-interactive",
    (name, instructions, instructionsLang, prompts, finish) => {
      console.log("conn.on('keyboard-interactive')");
      finish(["password"]);
    }
  );
};

export default shell;
