import GoogleStrategy from '../strategies/ScratchGoogle.ts';
import Dashport from '../dashport.ts'
import { assertEquals, assertNotEquals } from "https://deno.land/std@0.87.0/testing/asserts.ts"

const testDp = new Dashport('oak');
const options = {
  client_id:'1001553106526-ri9j20c9uipsp6q5ubqojbuc5e19dkgp.apps.googleusercontent.com',
  redirect_uri: 'http://localhost:3000/test', 
  response_type: 'code', 
  scope: 'profile email openid',
  client_secret: 'e44hA4VIInrJDu_isCDl3YCr',
  grant_type: 'authorization_code',
}
const goog = new GoogleStrategy(options)
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
const fakeNext = ()=>1

Deno.test({
  name: "Google Strategy should be formatted and apply its inputted values correctly",
  fn(): void{
    testDp.addStrategy('google', goog);
    assertNotEquals(testDp.authenticate('google'), new Error('ERROR in authenticate: This strategy name has not been specified for use.'));
  }
});

Deno.test({
  name: "goog.authorize, should redirect to Google for client authorization",
  async fn(): Promise<any>{
    assertEquals(await goog.authorize(fakeOakCtx, ()=>null), fakeOakCtx.response.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + goog.uriFromParams));
  }
});

Deno.test({
  name: "testDp.router should correctly call either authorize or get authToken",
  async fn(): Promise<any>{
    fakeOakCtx.request.url = {search : undefined};
    assertEquals(await goog.router(fakeOakCtx, fakeNext), await goog.authorize(fakeOakCtx, fakeNext));
    fakeOakCtx.request.url = {search : "?code=testing"};
    assertEquals(await goog.router(fakeOakCtx, fakeNext), await goog.getAuthToken(fakeOakCtx, fakeNext));
  }
});

Deno.test({
  name: "testDp.getAuthToken, should get the response from google, split string and return json data ",
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
        provider: "google",
        providerUserId: undefined,
        displayName: undefined,
        name: { familyName: undefined, givenName: undefined },
        emails: [ undefined ]
      }
    };
    assertEquals(await goog.getAuthToken(fakeOakCtx, fakeNext), returnVal)
  }
});

Deno.test({
  name: "testDp.getAuthData should return authorization data",
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
        provider: "google",
        providerUserId: undefined,
        displayName: undefined,
        name: { familyName: undefined, givenName: undefined },
        emails: [ undefined ]
      }
    };
    assertEquals(await goog.getAuthData({tokenData: returnVal.tokenData}), returnVal);
  } 
});

Deno.test({
  name: "Testing google.parseCode to see if it accurately parsed url encoding",
  fn() :void {
    assertEquals(goog.parseCode('%24%26%2B%2C%2F%3A%3B%3D%3F%40'), '$&+,/:;=?@')
  }
})