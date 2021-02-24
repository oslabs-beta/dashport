import { assert, assertEquals, assertThrows, assertThrowsAsync } from "../../deps.ts";
import Dashport from '../dashport.ts';
import { OakContext } from '../types.ts';

class TestStrat {
  async router(ctx: OakContext, next: any) {
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

function fakeSerializer(userInfo: any) {
  return 'ABCDEF';
}

function fakeDeserializer(serializedId: string) {
  return {
    firstName: 'Hello',
    lastName: 'World'
  };
}

const fakeNext: any = () => 'fakeNext was invoked';


Deno.test({
  name: "An instance of Dashport should throw an error if the framework is not supported.",
  fn(): void {
    assertThrows(() => new Dashport('express'));
  },
});

Deno.test({
  name: "_initializeDecider should throw if ctx.state is undefined.",
  fn(): void {
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

    const oakTestDp = new Dashport('oak');
    assertThrowsAsync(async () => await oakTestDp.initialize(fakeOakCtx, fakeNext));
  },
});


// AUTHENTICATE TESTS
Deno.test({
  name: "authenticate method should throw an error if the strategy name does not exist.",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    oakTestDp.addStrategy('Strategy1', new TestStrat());
    assertThrows(() => oakTestDp.authenticate('Strategy2')); 
  },
});

Deno.test({
  name: "If framework is Oak, authenticate method should throw an error if _dashport property does not exist on ctx.state.",
  fn(): void {
    const oakTestDp = new Dashport('oak');
    const fakeOakCtx: OakContext = {
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

    oakTestDp.addStrategy('Strategy1', new TestStrat());
    assertThrowsAsync(async () => await oakTestDp.authenticate('Strategy1')(fakeOakCtx, fakeNext));
  },
});

Deno.test({
  name: "If framework is Oak, authenticate should invoke the 'next' function if ctx.state._dashport.session equals dashport._sId.",
  async fn(): Promise<void> {
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

    oakTestDp._sId = '123456789';

    oakTestDp.addStrategy('Strategy1', new TestStrat());
    assertEquals(await oakTestDp.authenticate('Strategy1')(fakeOakCtx, fakeNext), 'fakeNext was invoked');
  },
});

Deno.test({
  name: "If framework is Oak and there is no session or session ID does not match, authenticate should call the strategy's router method and begin authentication.",
  async fn(): Promise<void> {
    const oakTestDp = new Dashport('oak');
    const fakeOakCtx: OakContext = {
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

    oakTestDp.addSerializer('Serializer1', fakeSerializer);
    oakTestDp.addDeserializer('Deserializer1', fakeDeserializer);
    oakTestDp.addStrategy('Strategy1', new TestStrat());
    // if authenticate was successful, the 'next' function should be invoked
    assertEquals(await oakTestDp.authenticate('Strategy1')(fakeOakCtx, fakeNext), 'fakeNext was invoked');
    // after authenticate was successful, the serialized ID should now exist on fakeOakCtx.state._dashport.session
    assertEquals(fakeOakCtx.state._dashport.session, 'ABCDEF');
    // after authenticate was successful, the serialized ID should now exist on oakTestDp._sId
    assertEquals(oakTestDp._sId, 'ABCDEF');
  },
});


// SERIALIZER TESTS
Deno.test({
  name: "addSerializer method should throw an error if exactly 1 parameter is not provided",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    assertThrows(() => oakTestDp.addSerializer('serializer1', () => 1));
    assertThrows(() => oakTestDp.addSerializer('serializer2', (test: any, testing: any) => 2));
  }
});

Deno.test({
  name: "addSerializer method should throw an error if a name already exists",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    oakTestDp.addSerializer('serializer1', (userInfo: string) => 1);
    assertThrows(() => oakTestDp.addSerializer('serializer1', (userInfo: string) => 2));
  }
});

Deno.test({
  name: "removeSerializer method should throw an error if a name does not exist",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    oakTestDp.addSerializer('serializer1', (userInfo: string) => 1);
    assertThrows(() => oakTestDp.removeSerializer('serializer2'));
  }
});

Deno.test({
  name: "removeSerializer method should throw an error if trying to remove a Serializer twice",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    oakTestDp.addSerializer('serializer1', (userInfo: string) => 1);
    oakTestDp.removeSerializer('serializer1');
    assertThrows(() => oakTestDp.removeSerializer('serializer1'));
  }
});


// DESERIALIZER TESTS
Deno.test({
  name: "addDeserializer method should throw an error if exactly 1 parameter is not provided",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    assertThrows(() => oakTestDp.addDeserializer('test', () => '{userInfo}'));
    assertThrows(() => oakTestDp.addDeserializer('tester', (test: any, testing: any) => '{userInfo}'));
  }
});

Deno.test({
  name: "addDeserializer method should throw an error if a name already exists",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    oakTestDp.addDeserializer('test', (serializedId: string) => '{userInfo}');
    assertThrows(() => oakTestDp.addDeserializer('test', (serializedId: string) => '{userInfo}'));
  }
});

Deno.test({
  name: "removeDeserializer method should throw an error if a name does not exist",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    oakTestDp.addDeserializer('test', (serializedId: string) => '{userInfo}');
    assertThrows(() => oakTestDp.removeDeserializer('testing'));
  }
});

Deno.test({
  name: "removeDeserializer method should throw an error if trying to remove a deserializer twice",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    oakTestDp.addDeserializer('test', (serializedId: string) => '{userInfo}');
    oakTestDp.removeDeserializer('test');
    assertThrows(() => oakTestDp.removeDeserializer('test'));
  }
});

Deno.test({
  name: "deserialize property should throw an error if no deserializers were added.",
  async fn() {
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
          session: '12345'
        }
      },
      assert: () => 1,
      send: () => 2,
      sendEvents: () => 3,
      throw: () => 4,
      upgrade: () => 5,
      params: {}
    }

    assertThrowsAsync(async () => await oakTestDp.deserialize(fakeOakCtx, fakeNext));
  }
});

Deno.test({
  name: "deserialize property should add an error onto ctx.locals if a session does not exist",
  async fn() {
    const oakTestDp = new Dashport('oak');
    const fakeOakCtx: OakContext = {
      app: {},
      cookies: {},
      request: {},
      respond: {},
      response: {},
      socket: {},
      state: {
        _dashport: {}
      },
      assert: () => 1,
      send: () => 2,
      sendEvents: () => 3,
      throw: () => 4,
      upgrade: () => 5,
      params: {}
    }

    oakTestDp.addDeserializer('test', (serializedId: string) => '{userInfo}');
    await oakTestDp.deserialize(fakeOakCtx, fakeNext);
    assert(fakeOakCtx.locals instanceof Error);
  }
});

Deno.test({
  name: "deserialize property should add an error onto ctx.locals if a session ID does not match",
  async fn() {
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
          session: '987'
        }
      },
      assert: () => 1,
      send: () => 2,
      sendEvents: () => 3,
      throw: () => 4,
      upgrade: () => 5,
      params: {}
    }

    oakTestDp.authenticate = function(stratName: string) {
      this._sId = '12345';
      return () => {};
    };
    
    oakTestDp.authenticate('test'); // should make oakTestDp._sId = '12345'
    oakTestDp.addDeserializer('test', (serializedId: string) => '{userInfo}');
    await oakTestDp.deserialize(fakeOakCtx, fakeNext);
    assert(fakeOakCtx.locals instanceof Error);
  }
});

Deno.test({
  name: "deserialize property should store userInfo on ctx.locals if serializedId on session object matches _sId",
  async fn() {
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
          session: '12345'
        }
      },
      assert: () => 1,
      send: () => 2,
      sendEvents: () => 3,
      throw: () => 4,
      upgrade: () => 5,
      params: {}
    }

    oakTestDp.authenticate = function(stratName: string) {
      this._sId = '12345';
      return () => {};
    };
    
    oakTestDp.authenticate('test'); // should make oakTestDp._sId = '12345'
    oakTestDp.addDeserializer('test', (serializedId: string) => '{userInfo}');
    await oakTestDp.deserialize(fakeOakCtx, fakeNext);
    assertEquals(fakeOakCtx.locals, '{userInfo}');
  }
});


// STRATEGY TESTS
Deno.test({
  name: "addStrategy method should throw an error if a name already exists",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    oakTestDp.addStrategy('Strategy1', new TestStrat());
    assertThrows(() => oakTestDp.addStrategy('Strategy1', new TestStrat()));
  }
});

Deno.test({
  name: "removeStrategy method should throw an error if a name does not exist",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    oakTestDp.addStrategy('Strategy1', new TestStrat());
    assertThrows(() => oakTestDp.removeStrategy('Strategy2'));
  }
});

Deno.test({
  name: "removeStrategy method should throw an error if trying to remove a strategy twice",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    oakTestDp.addStrategy('Strategy1', new TestStrat());
    oakTestDp.removeStrategy('Strategy1');
    assertThrows(() => oakTestDp.removeStrategy('Strategy1'));
  }
});
