const { app } = require("./app");
const { env } = require("./config");

app.listen(env.port, () => {
  console.log(`Server started on http://localhost:${env.port}`);
});
