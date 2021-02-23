import { Application, send, join } from './deps.ts'
import { html, ReactComponents, protectedPage } from './ssrConstants.tsx';
import router from "./routes.ts";
import Dashport from '../lib/dashport.ts'
import GoogleStrat from '../lib/strategies/ScratchGoogle.ts'
import FacebookStrategy from '../lib/strategies/Facebook.ts'
import GitHubStrategy from '../lib/strategies/Github.ts'
import LocalStrategy from '../lib/strategies/localstrategy.ts';
import LinkedIn from '../lib/strategies/LinkedIn.ts'
import pgclient from './models/userModel.ts'
import SpotifyStrategy from '../lib/strategies/Spotify.ts'

const port = 3000;
const app: Application = new Application();
const dashport = new Dashport('oak');

// Error handling
app.use(async (ctx: any, next: any) => {
  debugger;
  try{
    await next();
  } catch (error) {
    console.log('server err', error);
    throw error;
  }
});

app.use(dashport.initialize);

app.use(router.routes());
app.use(router.allowedMethods());

dashport.addStrategy('google', new GoogleStrat({
  client_id:'1001553106526-ri9j20c9uipsp6q5ubqojbuc5e19dkgp.apps.googleusercontent.com',
  redirect_uri: 'http://localhost:3000/google', 
  response_type: 'code', 
  scope: 'profile email openid',
  client_secret: 'e44hA4VIInrJDu_isCDl3YCr',
  grant_type: 'authorization_code',
}));

dashport.addStrategy('facebook', new FacebookStrategy({
  client_id: '176079343994638', 
  client_secret: 'ed0e2c29eae5394c332a83129a52ff59', 
  redirect_uri: 'http://localhost:3000/facebook', 
  state: '12345'
}));

dashport.addStrategy('github', new GitHubStrategy({
  client_id:'b3e8f06ac81ab03c46ca', 
  client_secret: 'b9cc08bb3318a27a8306e4fa74fc22758d29b3fc', 
  redirect_uri: 'http://localhost:3000/github', 
  scope: 'read:user',  
}));

dashport.addStrategy('spotify', new SpotifyStrategy({
  client_id:'646f25f80fc84e0e993f8216bdeee1ae',
  response_type: 'code', 
  redirect_uri: 'http://localhost:3000/spotify', 
  scope: 'user-read-email user-read-private',
  state: '2021',
  client_secret: '7e142bb9057d406fbcdaf48bebc10808',
}));

dashport.addStrategy('local', new LocalStrategy({
  usernamefield:'username', 
  passwordfield:'password', 
  authorize: async (curData:any) =>{
    const data = await pgclient.queryArray(`SELECT * FROM users WHERE username='${curData.username}' AND password='${curData.password}'`) || null;
    if (!data.rows) return new Error("Username or Password is incorrect");
    const userInfo:any = {provider:'local', providerUserId:data.rows[0][0], displayName:data.rows[0][1]};
    return userInfo; 
  }, }));

  dashport.addStrategy('linkedin', new LinkedIn({
    client_id:'788zz8dnnxjo4s',
    redirect_uri: 'http://localhost:3000/linkedin', 
    response_type: 'code', 
    scope: 'r_liteprofile%20r_emailaddress%20w_member_social',
    client_secret: 'FHhQQW3BaNQCFilA',
    grant_type: 'authorization_code',
  }));

dashport.addSerializer('mathRand', (userData: any) => Math.random() * 10000);

router.get('/google', 
  dashport.authenticate('google'),
  (ctx: any, next: any) => {
    if(ctx.state._dashport.session){
      ctx.response.redirect('/protected');
    }
  }
)

router.get('/facebook', 
  dashport.authenticate('facebook'),
  (ctx: any, next: any) => {
    if(ctx.state._dashport.session){
      ctx.response.redirect('/protected');
    }
  }
)

router.get('/spotify', 
  dashport.authenticate('spotify'),
  (ctx: any, next: any) => {
    if(ctx.state._dashport.session){
      ctx.response.redirect('/protected');
    }
  }
)

router.get('/github', 
  dashport.authenticate('github'),
  (ctx: any, next: any) => {
    if(ctx.state._dashport.session){
      ctx.response.redirect('/protected');
    }
  }
)

router.post('/local', 
  dashport.authenticate('local'),
  (ctx: any, next: any) => {
    ctx.response.type = 'text/json';
    ctx.response.body = JSON.stringify(true);
  }
);

router.get('/linkedin', 
  dashport.authenticate('linkedin'),
  (ctx: any, next: any) => {
    if(ctx.state._dashport.session){
      ctx.response.redirect('/protected');
    }
  }
)

router.post('/signup', 
  async (ctx:any, next: any)=>{ 
    let userInfo:any = await ctx.request.body(true).value;
    console.log(userInfo);
    await pgclient.queryArray(`INSERT INTO users(username, password) VALUES ('${userInfo.username}', '${userInfo.password}')`);
    return next();
  }, 
  dashport.authenticate('local'),
  (ctx: any, next: any) => {
    ctx.response.type = 'text/json';
    ctx.response.body = JSON.stringify(true);
  }
  );

router.get('/protected',
  (ctx: any, next: any) => {
    if(!ctx.state._dashport.session){
      ctx.response.body = 'You need to log in first. Please try again'
    } else {
      ctx.response.type = `text/html`
      ctx.response.body = protectedPage
    };
  }
);

//response tracking
app.use(async (ctx: any, next: any) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log( 
    `${ctx.request.method} ${ctx.request.url} - Response Time = ${rt}`
  );
});

app.use(async (ctx: any, next: any) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

// page routing
app.use(async (ctx: any) => {
   if (ctx.request.url.pathname === '/') { 
     ctx.response.type = `text/html`
     ctx.response.body = html
   }  else if (ctx.request.url.pathname === '/test.js') {
      ctx.response.type = "application/javascript"
      ctx.response.body = ReactComponents
   }  else if (ctx.request.url.pathname === '/style.css') {
      ctx.response.type = "text/css"
      await send(ctx, ctx.request.url.pathname, {
        // TODO FIX: Currently have to "deno run --unstable -A demo/server.tsx" from /dashport
        // Unable to "deno run --unstable -A server.tsx" from /dashport/demo
        root: join(Deno.cwd(), "demo/views/assets"),
      });
   }
});

// listening on port
app.addEventListener('listen', () => { console.log(`Server live on port ${port}`) });
await app.listen({ port });

// denon run --allow-all --unstable demo/server.tsx
// deno install -qAf --unstable https://deno.land/x/denon/denon.ts
