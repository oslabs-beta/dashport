import GoogleStrategy from '../strategies/ScratchGoogle.ts';
import Dashport from '../dashport.ts'
import { assertEquals, assertNotEquals } from "https://deno.land/std@0.87.0/testing/asserts.ts"

const fakeOptions = {
  client_id:'1001553106526-ri9j20c9uipsp6q5ubqojbuc5e19dkgp.apps.googleusercontent.com',
  redirect_uri: 'http://localhost:3000/test', 
  response_type: 'code', 
  scope: 'profile email openid',
  client_secret: 'e44hA4VIInrJDu_isCDl3YCr',
  grant_type: 'authorization_code',
};
const fakeOakCtx = {
  app: {},
  cookies: {},
  request: { url: {} },
  respond: {},
  response: { redirect: (string: string) => "Redirect Occurred" },
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
  name: "GoogleStrategy should have a router method and be initialized with correct default properties",
  fn(): void{
    const goog = new GoogleStrategy(fakeOptions);

    assertNotEquals(goog.router, undefined);
    assertEquals(goog.name, 'google');
    assertEquals(goog.options, {
      client_id:'1001553106526-ri9j20c9uipsp6q5ubqojbuc5e19dkgp.apps.googleusercontent.com',
      redirect_uri: 'http://localhost:3000/test', 
      response_type: 'code', 
      scope: 'profile email openid',
      client_secret: 'e44hA4VIInrJDu_isCDl3YCr',
      grant_type: 'authorization_code',
    });
    assertEquals(goog.uriFromParams, 'client_id=1001553106526-ri9j20c9uipsp6q5ubqojbuc5e19dkgp.apps.googleusercontent.com&redirect_uri=http://localhost:3000/test&response_type=code&scope=profile email openid&');
  }
});

Deno.test({
  name: "authorize method should redirect to Google for client authorization",
  async fn(): Promise<any> {
    const goog = new GoogleStrategy(fakeOptions);

    assertEquals(await goog.authorize(fakeOakCtx, () => null), fakeOakCtx.response.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + goog.uriFromParams));
  }
});

Deno.test({
  name: "router method should correctly call either authorize or getAuthToken",
  async fn(): Promise<any> {
    const goog = new GoogleStrategy(fakeOptions);

    fakeOakCtx.request.url = {search : undefined};
    assertEquals(await goog.router(fakeOakCtx, fakeNext), await goog.authorize(fakeOakCtx, fakeNext));
    fakeOakCtx.request.url = {search : "?code=testing"};
    assertEquals(await goog.router(fakeOakCtx, fakeNext), await goog.getAuthToken(fakeOakCtx, fakeNext));
  }
});

Deno.test({
  name: "getAuthToken method, should get the response from google, split string and return json data ",
  async fn(): Promise<any> {
    const goog = new GoogleStrategy(fakeOptions);
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
  name: "getAuthData method should return authorization data",
  async fn(): Promise<any> {
    const goog = new GoogleStrategy(fakeOptions);
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
  name: "parseCode method should return accurately parsed url encoding",
  fn() :void {
    const goog = new GoogleStrategy(fakeOptions);

    assertEquals(goog.parseCode('%24%26%2B%2C%2F%3A%3B%3D%3F%40'), '$&+,/:;=?@')
  }
})
