import LinkedInStrategy from '../strategies/Facebook.ts';
import Dashport from '../dashport.ts'
import { assertEquals, assertNotEquals } from "https://deno.land/std@0.87.0/testing/asserts.ts"

const testDp = new Dashport('oak');
const options = {
  client_id:'176079343994638',
  client_secret: 'e44hA4VIInrJDu_isCDl3YCr',
  redirect_uri: 'http://localhost:3000/test', 
  state: '{st=state123abc,ds=123456789}',
  response_type: 'code', 
  scope: 'email',
}
const facebook = new LinkedInStrategy(options)
const fakeOakCtx = {
  app: {},
  cookies: {},
  request: {url:{}},
  respond: {},
  response: {redirect: (string: string)=>"Redirect Occurred"},
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
}
const fakeNext = ()=> 1

Deno.test({
  name: "facebook.authorize should redirect and URIfromParams should assemble the proper link",
  async fn(): Promise<any> {
    assertEquals(await facebook.authorize(fakeOakCtx, fakeNext), fakeOakCtx.response.redirect((facebook.authURL + facebook.uriFromParams)));
    assertEquals((facebook.authURL + facebook.uriFromParams), 'https://www.facebook.com/v9.0/dialog/oauth?client_id=176079343994638&redirect_uri=http://localhost:3000/test&state={st=state123abc,ds=123456789}&response_type=code&scope=email&');
  }
});

Deno.test({
  name: "testDp.router should correctly call either authorize or getAuthToken",
  async fn(): Promise<any>{
    fakeOakCtx.request.url = {search : undefined};
    assertEquals(await facebook.router(fakeOakCtx, fakeNext), await facebook.authorize(fakeOakCtx, fakeNext));
    fakeOakCtx.request.url = {search : "?code=testing"};
    assertEquals(await facebook.router(fakeOakCtx, fakeNext), await facebook.getAuthToken(fakeOakCtx, fakeNext));
  }
});

Deno.test({
  name: "facebook.getAuthToken should get the response from fb, split the string and return json data ",
   async fn(): Promise<any>{
    const returnVal: any = {
      tokenData: {
        access_token: undefined,
        expires_in: undefined,
        scope: undefined,
        token_type: undefined,
        id_token: undefined
      },
      userInfo: {
        provider: "facebook",
        providerUserId: undefined,
        displayName: undefined,
        name: { familyName: undefined, givenName: undefined },
        emails: [ undefined ]
      }
    };
    assertEquals(await facebook.getAuthToken(fakeOakCtx, fakeNext), returnVal)
  }
});

// Deno.test({
//   name: "testDp.getAuthData should return authorization data",
//   async fn(): Promise<any>{
//     const returnVal: any = {
//       tokenData: {
//         access_token: undefined,
//         expires_in: undefined,
//         scope: undefined,
//         token_type: undefined,
//         id_token: undefined
//       },
//       userInfo: {
//         provider: "facebook",
//         providerUserId: undefined,
//         displayName: undefined,
//         name: { familyName: undefined, givenName: undefined },
//         emails: [ undefined ]
//       }
//     };
//     assertEquals(await facebook.getAuthData({tokenData: returnVal.tokenData}), returnVal);
//   } 
// });

// Deno.test({
//   name: "facebook.parseCode should accurately parse the url",
//   fn() :void {
//     assertEquals(facebook.parseCode('%24%26%2B%2C%2F%3A%3B%3D%3F%40'), '$&+,/:;=?@')
//   }
// })