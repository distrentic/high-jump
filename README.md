# high-jump

An SSH jump server using `ssh2`, `socket.io` and `express`.

`high-jump` consists of two main parts: A ready to use server and a core library. There is also an example client.

- [Library](./lib)
- [Server](./server)
- [Example Client](./examples/client)

## How to use

You can either use the existing [high-jump server](./server) or build your own by using [the core library](./lib).

### Docker

If you want to quickly _jump_ into the action, the easiest way is to spin up a docker container.

```sh
docker run --name high-jump -p 8080:8022 distrentic/high-jump:latest
```

## Connecting to high-jump

If you have a running `high-jump` server, `xtermjs` based example [client](./examples/client) can connect to it! However it needs a little bit of configuration.

[./examples/client/index.ts](./examples/client/index.ts)

```typescript
// snip

socket.on("connect", () => {
  socket.emit("shell", {
    host: "raspberrypi.local",
    port: 22,
    username: "pi",

    // you can use password authentication
    password: "raspberry",

    // or alternatively privateKey authentication with optional passphrase
    privateKey: "",
    passphrase: "",
    // ...
  });
});

// snip
```

When you are done with connection details, you can run the example client.

```sh
cd examples/client
yarn install && yarn build
yarn start
```

## License

Licensed under MIT license ([LICENSE](LICENSE) or <http://opensource.org/licenses/MIT>)
