import { assertEquals, assertThrows } from "https://deno.land/std@0.87.0/testing/asserts.ts"
import Dashport from '../dashport.ts';
import { OakContext } from '../types.ts';

Deno.test({
  name: "addDeserializer method should throw an error if exactly 1 parameter is not provided",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    assertThrows(() => oakTestDp.addDeserializer('test', () => '{userInfo}'));
    assertThrows(() => oakTestDp.addDeserializer('tester', (test: any, testing: any) => '{userInfo}'));
  }
})

Deno.test({
  name: "addDeserializer method should throw an error if a name already exists",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    oakTestDp.addDeserializer('test', (serializedId: string) => '{userInfo}');
    assertThrows(() => oakTestDp.addDeserializer('test', (serializedId: string) => '{userInfo}'));
  }
})

Deno.test({
  name: "removeDeserializer method should throw an error if a name does not exist",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    oakTestDp.addDeserializer('test', (serializedId: string) => '{userInfo}');
    assertThrows(() => oakTestDp.removeDeserializer('testing'));
  }
})

Deno.test({
  name: "removeDeserializer method should throw an error if trying to remove a deserializer twice",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    oakTestDp.addDeserializer('test', (serializedId: string) => '{userInfo}');
    oakTestDp.removeDeserializer('test');
    assertThrows(() => oakTestDp.removeDeserializer('test'));
  }
})

Deno.test({
  name: "deserialize \"method\" should store userInfo on ctx.locals if serializedId on session object matches _sId",
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
    const fakeNext = () => 1;

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
