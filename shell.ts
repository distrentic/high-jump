import { Socket } from "socket.io";
import ssh2 from "ssh2";

const shell = (socket: Socket) => {
  const session = new ssh2.Client();
  let rows: number;
  let cols: number;
  let height: number;
  let width: number;

  socket.on(
    "size",
    (data: { rows: number; cols: number; height: number; width: number }) => {
      rows = data.rows;
      cols = data.cols;
      height = data.height;
      width = data.width;
    }
  );

  session.on("banner", (data) => {
    // need to convert to cr/lf for proper formatting
    data = data.replace(/\r?\n/g, "\r\n");
    socket.emit("data", Buffer.from(data, "utf-8"));
  });

  session.on("ready", () => {
    session.shell(
      { term: "xterm-color", rows, cols, height, width },
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

  session.connect({
    host: "",
    port: 22,
    username: "",
    password: "",
    tryKeyboard: true,
  });
};

export default shell;
