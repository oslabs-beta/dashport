import { assertEquals, assertNotEquals } from '../../deps.ts';
import SessionManager from '../sessionManager.ts';
import Dashport from '../dashport.ts';

const oakTestSM = new SessionManager('oak');
const testDp = new Dashport('oak');
const fakeOakCtx = {
  app: {},
  cookies: {},
  request: {},
  respond: {},
  response: {},
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

Deno.test({
  name: "A new SessionManager should have the properties logIn, logOut, and serialize",
  fn(): void {
    assertNotEquals(oakTestSM.logIn, undefined);
    assertNotEquals(oakTestSM.logOut, undefined);
    assertNotEquals(oakTestSM.serialize, undefined);
  },
});

Deno.test({
  name: "When invoked, logIn method should add a session property with the value of the serializedId passed in onto ctx.state._dashport",
  fn(): void {
    oakTestSM.logIn(fakeOakCtx, testDp, '1234567890');
    assertEquals(fakeOakCtx.state._dashport.session, '1234567890');
  },
});
