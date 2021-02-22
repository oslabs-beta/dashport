import LinkedInStrategy from '../strategies/LinkedIn.ts';
import { assertEquals, assertNotEquals, assert } from "https://deno.land/std@0.87.0/testing/asserts.ts"

const fakeOptions = {
  client_id:'788zz8dnnxjo4s',
  redirect_uri: 'http://localhost:3000/linkedin', 
  response_type: 'code', 
  scope: 'r_liteprofile%20r_emailaddress%20w_member_social',
  client_secret: 'FHhQQW3BaNQCFilA',
  grant_type: 'authorization_code',
};
const fakeOakCtx = {
  app: {},
  cookies: {},
  request: { url: {} },
  respond: {},
  response: {redirect: (string: string)=>string},
  socket: {},
  state: {
    _dashport: { 
      session: ''
    }
  },
  assert: () => 1,
  send: () => 2,
  sendEvents: () => 3,
  throw: () => 4,
  upgrade: () => 5,
  params: {}
};
const fakeNext = () => 1;

Deno.test({
  name: "LinkedIn strategy should check if a created instance of LinkedIn strategy has a name property of \"linkedIn\", and \"options\" and \"uriFromParams\" properties exist. It should also have a router method.",
  fn(): void{
    const linkedin = new LinkedInStrategy(fakeOptions);

    assert(linkedin.router);
    assertEquals(linkedin.name, 'linkedIn')
    assertEquals(linkedin.options, {
      client_id:'788zz8dnnxjo4s',
      redirect_uri: 'http://localhost:3000/linkedin', 
      response_type: 'code', 
      scope: 'r_liteprofile%20r_emailaddress%20w_member_social',
      client_secret: 'FHhQQW3BaNQCFilA',
      grant_type: 'authorization_code'
  })
  assertEquals(linkedin.uriFromParams, 'client_id=788zz8dnnxjo4s&redirect_uri=http://localhost:3000/linkedin&response_type=code&scope=r_liteprofile%20r_emailaddress%20w_member_social&')  
  }
});

Deno.test({
  name: "LinkedIn's router method should correctly call either authorize or getAuthToken",
  async fn(): Promise<any> {
    const linkedin = new LinkedInStrategy(fakeOptions);

    fakeOakCtx.request.url = {search : undefined};
    assertEquals(await linkedin.router(fakeOakCtx, fakeNext), await linkedin.authorize(fakeOakCtx, fakeNext));
    fakeOakCtx.request.url = {search : "?code=testing"};
    assertEquals(await linkedin.router(fakeOakCtx, fakeNext), await linkedin.getAuthToken(fakeOakCtx, fakeNext));
  }
});


Deno.test({
  name: "LinkedIn's authorize method should redirect to LinkedIn for client authorization",
  async fn(): Promise<any>{
    const linkedin = new LinkedInStrategy(fakeOptions);

    assertEquals(await linkedin.authorize(fakeOakCtx, fakeNext), fakeOakCtx.response.redirect('https://www.linkedin.com/oauth/v2/authorization?' + linkedin.uriFromParams));
  }
});

// Deno.test({
//   name: "getAuthToken method, should get the response from LinkedIn, split string and return json data ",
//   async fn(): Promise<any> {
//     const linkedin = new LinkedInStrategy(fakeOptions);
//     const returnVal: any = {
//       tokenData: {
//         access_token: undefined,
//         expires_in: undefined,
//         scope: undefined,
//         token_type: undefined,
//         id_token: undefined
//       },
//       userInfo: {
//         provider: "linkedIn",
//         providerUserId: undefined,
//         displayName: undefined,
//         name: { familyName: undefined, givenName: undefined },
//         emails: [ undefined ]
//       }
//     };

//     assertEquals(await linkedin.getAuthToken(fakeOakCtx, fakeNext), returnVal)
//   }
// });

// Deno.test({
//   name: "getAuthData method should return authorization data",
//   async fn(): Promise<any> {
//     const linkedin = new LinkedInStrategy(fakeOptions);
//     const returnVal: any = {
//       tokenData: {
//         access_token: undefined,
//         expires_in: undefined,
//         scope: undefined,
//         token_type: undefined,
//         id_token: undefined
//       },
//       userInfo: {
//         provider: "linkedIn",
//         providerUserId: undefined,
//         displayName: undefined,
//         name: { familyName: undefined, givenName: undefined },
//         emails: [ undefined ]
//       }
//     };

//     assertEquals(await linkedin.getAuthData({tokenData: returnVal.tokenData}), returnVal);
//   } 
// });