import { assertEquals, assertThrows, assertThrowsAsync } from "../../deps.ts";
import DashportOak from '../dashportOak.ts';

// Mock class and functions
class TestStrat {
  async router(ctx, next) {
    if (ctx.state.testing = 'user') {
      return {
        authData: {
          access_token: 'AccessToken000'
        },
        userInfo: {
          provider: 'test',
          providerUserId: 'ID12345'
        }
      }
    }

    return new Error('ERROR: This is an Error');
  }
}

function fakeSerializer(userInfo) {
  return 'ABCDEF';
}

function fakeDeserializer(serializedId) {
  return {
    firstName: 'Hello',
    lastName: 'World'
  };
}

const fakeNext = () => 'fakeNext was invoked';



// INITIALIZE TEST
Deno.test({
  name: "initialize should throw if ctx.state is undefined.",
  fn() {
    const fakeOakCtx = {
      app: {},
      cookies: {},
      request: {},
      respond: {},
      response: {},
      socket: {},
      assert: () => 1,
      send: () => 2,
      sendEvents: () => 3,
      throw: () => 4,
      upgrade: () => 5,
      params: {}
    }

    const testDpOak = new DashportOak();
    assertThrowsAsync(async () => await testDpOak.initialize(fakeOakCtx, fakeNext));
  },
});

Deno.test({
  name: "initialize should add a _dashport object onto ctx.state.",
  async fn() {
    const fakeOakCtx = {
      app: {},
      cookies: {},
      request: {},
      respond: {},
      response: {},
      socket: {},
      assert: () => 1,
      send: () => 2,
      sendEvents: () => 3,
      throw: () => 4,
      upgrade: () => 5,
      params: {},
      state: {}
    }

    const testDpOak = new DashportOak();
    await testDpOak.initialize(fakeOakCtx, fakeNext);

    assertEquals(Object.keys(fakeOakCtx.state)[0], '_dashport');
    assertEquals(Object.values(fakeOakCtx.state)[0], {});
  },
});



// AUTHENTICATE TESTS
Deno.test({
  name: "authenticate should throw an error if three arguments are not passed.",
  fn() {
    const testDpOak = new DashportOak();

    assertThrows(() => testDpOak.authenticate({test: 'foobar'}));
    assertThrows(() => testDpOak.authenticate({test: 'foobar'}, fakeSerializer));
    assertThrows(() => testDpOak.authenticate(fakeSerializer, fakeDeserializer));
    assertThrows(() => testDpOak.authenticate(fakeDeserializer));
  },
});


// Strategy tests
Deno.test({
  name: "authenticate should throw an error if strategy is not an object.",
  fn() {
    const testDpOak = new DashportOak();

    assertThrows(() => testDpOak.authenticate('hello world', fakeSerializer, fakeDeserializer));
  },
});

Deno.test({
  name: "authenticate should throw an error if strategy does not have a router property.",
  fn() {
    const testDpOak = new DashportOak();

    assertThrows(() => testDpOak.authenticate({ test: 'hello world' }, fakeSerializer, fakeDeserializer));
  },
});

Deno.test({
  name: "authenticate should throw an error if strategy's router property is not a function.",
  fn() {
    const testDpOak = new DashportOak();

    assertThrows(() => testDpOak.authenticate({ router: 'hello world' }, fakeSerializer, fakeDeserializer));
  },
});


// Serializer tests
Deno.test({
  name: "authenticate should throw an error if serializer is not a function.",
  fn() {
    const testDpOak = new DashportOak();

    assertThrows(() => testDpOak.authenticate(new TestStrat(), 'dashport', fakeDeserializer));
  },
});

Deno.test({
  name: "authenticate should throw an error if serializer does not take exactly 1 parameter.",
  fn() {
    const testDpOak = new DashportOak();

    assertThrows(() => testDpOak.authenticate(new TestStrat(), () => 1, fakeDeserializer));
    assertThrows(() => testDpOak.authenticate(new TestStrat(), (test, testing) => 1, fakeDeserializer));
  },
});


// Deserializer tests
Deno.test({
  name: "authenticate should throw an error if deserializer is not a function.",
  fn() {
    const testDpOak = new DashportOak();

    assertThrows(() => testDpOak.authenticate(new TestStrat(), fakeSerializer, 'dashport'));
  },
});

Deno.test({
  name: "authenticate should throw an error if deserializer does not take exactly 1 parameter.",
  fn() {
    const testDpOak = new DashportOak();

    assertThrows(() => testDpOak.authenticate(new TestStrat(), fakeSerializer, () => 'foobar'));
    assertThrows(() => testDpOak.authenticate(new TestStrat(), fakeSerializer, (id, testing) => 'foobar'));
  },
});


// Invocation of middleware tests
Deno.test({
  name: "authenticate's middleware should throw an error if _dashport object does not exist on ctx.state.",
  fn() {
    const testDpOak = new DashportOak();
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
    }

    assertThrowsAsync(async () => await testDpOak.authenticate(new TestStrat(), fakeSerializer, fakeDeserializer)(fakeOakCtx, fakeNext));
  },
});

Deno.test({
  name: "If ctx.state._dashport.session equals dashport._sId, authenticate should store the deserialized user info on ctx.locals and invoke the 'next' function.",
  async fn() {
    const testDpOak = new DashportOak();
    const fakeOakCtx = {
      app: {},
      cookies: {},
      request: {},
      respond: {},
      response: {},
      socket: {},
      state: {
        _dashport: {
          session: '123456789'
        }
      },
      assert: () => 1,
      send: () => 2,
      sendEvents: () => 3,
      throw: () => 4,
      upgrade: () => 5,
      params: {}
    }

    testDpOak._sId = '123456789';

    assertEquals(await testDpOak.authenticate(new TestStrat(), fakeSerializer, fakeDeserializer)(fakeOakCtx, fakeNext), 'fakeNext was invoked');
    assertEquals(fakeOakCtx.locals, { firstName: 'Hello', lastName: 'World' });
  },
});

Deno.test({
  name: "If there is no session or session ID does not match, authenticate should call the strategy's router method and begin authentication.",
  async fn(){
    const testDpOak = new DashportOak();
    const fakeOakCtx = {
      app: {},
      cookies: {},
      request: {},
      respond: {},
      response: {},
      socket: {},
      state: {
        _dashport: {},
        testing: 'user'
      },
      assert: () => 1,
      send: () => 2,
      sendEvents: () => 3,
      throw: () => 4,
      upgrade: () => 5,
      params: {}
    }

    // if authenticate was successful, the 'next' function should be invoked
    assertEquals(await testDpOak.authenticate(new TestStrat(), fakeSerializer, fakeDeserializer)(fakeOakCtx, fakeNext), 'fakeNext was invoked');
    // after authenticate was successful, the serialized ID should now exist on fakeOakCtx.state._dashport.session
    assertEquals(fakeOakCtx.state._dashport.session, 'ABCDEF');
    // after authenticate was successful, the serialized ID should now exist on testDpOak._sId
    assertEquals(testDpOak._sId, 'ABCDEF');
    // after authenticate was successful, deserialized info should exist on ctx.locals
    assertEquals(fakeOakCtx.locals, { firstName: 'Hello', lastName: 'World' });
  },
});



// LOGOUT TEST
Deno.test({
  name: "logOut should delete the session property on ctx.state._dashport",
  async fn() {
    const testDpOak = new DashportOak();
    const fakeOakCtx = {
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
    await testDpOak.logOut(fakeOakCtx, fakeNext);
    assertEquals(fakeOakCtx.state._dashport.session, undefined);
  }
});
