import Dashport from '../dashport.ts';
import { assertEquals, assertNotEquals, assertThrows, assertThrowsAsync } from '../../deps.ts';

class TestStrat {
  async router(ctx: any, next: any) {
    return {
      userInfo: {
        provider: 'test',
        providerUserId: '12345',
        displayName: 'Dashport',
        name: {
          familyName: 'port',
          givenName: 'Dash',
        }
      }
    };
  }
}

Deno.test({
  name: "A new Dashport instance should include properties _sId, initialize, authenticate, " +
  "addSerializer, removeSerializer, addStrategy, removeStrategy, and getUserInfo.",
  fn(): void {
    const oakTestDash = new Dashport('oak');

    assertEquals(oakTestDash._sId, '');
    assertNotEquals(oakTestDash.initialize, undefined);
    assertNotEquals(oakTestDash.authenticate, undefined)
    assertNotEquals(oakTestDash.addSerializer, undefined)
    assertNotEquals(oakTestDash.removeSerializer, undefined)
    assertNotEquals(oakTestDash.addStrategy, undefined)
    assertNotEquals(oakTestDash.removeStrategy, undefined)
    assertNotEquals(oakTestDash.getUserInfo, undefined)
  },
});

Deno.test({
  name: "when Dashport is invoked with 'oak', initialize should create a _dashport object on ctx.state",
  fn(): void {
    const oakTestDash = new Dashport('oak');
    const fakeOakCtx = {
      app: {},
      cookies: {},
      request: {},
      respond: {},
      response: {},
      socket: {},
      state: {},
      assert: () => 1,
      send: () => 2,
      sendEvents: () => 3,
      throw: () => 4,
      upgrade: () => 5,
      params: {}
    };
    const fakeNext = () => 1;

    assertEquals(Object.keys(fakeOakCtx.state).length, 0);
    oakTestDash.initialize(fakeOakCtx, fakeNext);
    assertEquals(Object.keys(fakeOakCtx.state)[0], '_dashport');
  },
});

Deno.test({
  name: "Authenticate method should check if strategy name passed in exists in _strategies",
  fn(): void {
    const oakTestDash = new Dashport('oak');

    oakTestDash.addStrategy('testStrat', new TestStrat());
    assertThrows(() => oakTestDash.authenticate('hi'));
  },
});

Deno.test({
  name: "If _dashport has not been initialized in state, authenticate method should throw an error",
  fn(): void {
    const oakTestDash = new Dashport('oak');
    const fakeOakCtx = {
      app: {},
      cookies: {},
      request: {},
      respond: {},
      response: {},
      socket: {},
      state: { _dashport: '' },
      assert: () => 1,
      send: () => 2,
      sendEvents: () => 3,
      throw: () => 4,
      upgrade: () => 5,
      params: {}
    };
    const fakeNext = () => 1;

    oakTestDash.addStrategy('testStrat', new TestStrat());
    assertThrowsAsync(async () => await oakTestDash.authenticate('testStrat')(fakeOakCtx, fakeNext));
  },
});

// Deno.test({
//   name: "If a session object exists on ctx.state._dashport, authenticate method " + 
//         "should compare the IDs and invoke next",
//   fn(): void {

//   },
// });

// Deno.test({
//   name: "If a session object does not exist on ctx.state._dashport, or IDs do not match, " + 
//         "authenticate method should begin the authentication process",
//   fn(): void {

//   },
// });

// Deno.test({
//   name: "authenticate method should .....",
//   fn(): void {

//   },
// });

// Deno.test({
//   name: "addSerializer method should .....",
//   fn(): void {

//   },
// });

// Deno.test({
//   name: "removeSerializer method should .....",
//   fn(): void {

//   },
// });


// Deno.test({
//   name: "addStrategy method should .....",
//   fn(): void {
//     const oakTestDash = new Dashport('oak');
//     const fakeStrat = new TestStrat();

//     assertEquals(oakTestDash[_strategies], {});
//     oakTestDash.addStrategy('test', fakeStrat);
//     assertEquals(oakTestDash[_strategies], { test: fakeStrat });
//   },
// });

// Deno.test({
//   name: "removeStrategy method should .....",
//   fn(): void {

//   },
// });

// Deno.test({
//   name: "getUserInfo method should .....",
//   fn(): void {

//   },
// });
