const { app } = require("./app");
const { env } = require("./config");

const server = app.listen(env.port, () => {
  console.log(`Server started on http://localhost:${env.port}`);
});

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(
      `\nПорт ${env.port} зайнятий. На Windows часто 4000 займає Docker Desktop — у server/.env постав PORT=4001 і перезапусти.\n`
    );
  }
  throw err;
});
