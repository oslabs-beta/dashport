import { assertEquals, assertNotEquals } from '../../deps.ts';
import SessionManager from '../sessionManager.ts';
import Dashport from '../dashport.ts';
import { OakContext, Serializers, UserProfile } from "../types.ts";

const oakTestSM = new SessionManager('oak');

Deno.test({
  name: "A new SessionManager should have the properties logIn, logOut, and serialize",
  fn(): void {
    assertNotEquals(oakTestSM.logIn, undefined);
    assertNotEquals(oakTestSM.logOut, undefined);
    assertNotEquals(oakTestSM.serialize, undefined);
  }
});

Deno.test({
  name: "When invoked, logIn method should (1) change the value of session property on ctx.state._dashport to the serializedId passed in and " +
        "(2) change the _sId property on dashport to the serializedId passed in",
  fn(): void {
    const oakTestDp = new Dashport('oak');
    const fakeOakCtx: OakContext = {
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

    assertEquals(fakeOakCtx.state._dashport.session, '');
    assertEquals(oakTestDp._sId, '');
    oakTestSM.logIn(fakeOakCtx, oakTestDp, '1234567890');
    assertEquals(fakeOakCtx.state._dashport.session, '1234567890');
    assertEquals(oakTestDp._sId, '1234567890');
  }
});

Deno.test({
  name: "When invoked, logOut method should delete the session property on ctx.state._dashport",
  fn(): void {
    const fakeOakCtx: OakContext = {
      app: {},
      cookies: {},
      request: {},
      respond: {},
      response: {},
      socket: {},
      state: {
        _dashport: {
          session: '123'
        }
      },
      assert: () => 1,
      send: () => 2,
      sendEvents: () => 3,
      throw: () => 4,
      upgrade: () => 5,
      params: {}
    }

    assertEquals(fakeOakCtx.state._dashport.session, '123');
    oakTestSM.logOut(fakeOakCtx);
    assertEquals(fakeOakCtx.state._dashport.session, undefined);
  }
});

Deno.test({
  name: "When invoked, serialize method should execute a serializer function from an object of serializers and return a serialized ID",
  fn(): void {
    const testProfile: UserProfile = {
      provider: 'google',
      providerUserId: '0987654321',
      displayName: 'Dashport',
      name: {
        familyName: 'port',
        givenName: 'Dash'
      }
    };

    const fakeDB: any = {};

    function testFunc(userInfo: UserProfile) {
      fakeDB['test'] = userInfo
      return '2468';
    };

    const testSerializers: Serializers = {
      '1': testFunc
    };

    // fakeDB should be empty
    assertEquals(fakeDB, {});
    // running serialize should output a serialized ID ('2468')
    assertEquals(oakTestSM.serialize(testSerializers, testProfile), '2468');
    // after running serialize, fakeDB should be filled with the test info
    assertEquals(fakeDB, {
      test: {
        provider: 'google',
        providerUserId: '0987654321',
        displayName: 'Dashport',
        name: {
          familyName: 'port',
          givenName: 'Dash'
        }
      }
    });
  }
});
