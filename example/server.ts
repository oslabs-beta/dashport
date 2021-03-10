import { Application, Router } from 'https://deno.land/x/oak/mod.ts';
import dashport from './dashportconfig.ts';

const port = 8000;

const app = new Application();
const router = new Router();

app.use(dashport.initialize);

router.get('/', async (ctx) => {
  ctx.response.type = "text/html";
  ctx.response.body = `
    <ul>
    <li><a href="/privatepage">privatepage</a>
    <li><a href="/user-favorites">user-favorites</a>
    <li><a href="/log-out">log-out</a>
    </ul>
  `;
});

router.get('/privatepage',
  dashport.authenticate('goog') as any,
  async (ctx: any, next: any) => {
    ctx.response.body = 'This is a private page!';
  }
)

router.get('/user-favorites',
  dashport.deserialize,
  async (ctx: any, next: any) => {
    const displayName = ctx.locals.displayName;
    ctx.response.body = `Welcome ${displayName}!`;
  }
)

router.get('/log-out',
  dashport.logOut as any,
  async (ctx: any, next: any) => {
    ctx.response.body = "You've logged out";
  }
)

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("error", (evt) => {
  console.log(evt.error);
});

console.log('running on port', port);
await app.listen({ port });
