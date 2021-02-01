// https://oakserver.github.io/oak/
import { Application } from './deps.ts'

const port = 3000;
const app = new Application();

app.use((ctx) => {
  ctx.response.body = "Hello world!";
});

await app.listen({ port });
