import { assertEquals, assertThrows } from "https://deno.land/std@0.87.0/testing/asserts.ts"
import Dashport from '../dashport.ts';
import { OakContext } from '../types.ts';

//SERIALIZER TESTS
Deno.test({
  name: "addSerializer method should throw an error if exactly 1 parameter is not provided",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    assertThrows(() => oakTestDp.addSerializer('serializer1', () => 1));
    assertThrows(() => oakTestDp.addSerializer('serializer2', (test: any, testing: any) => 2));
  }
})

Deno.test({
  name: "addSerializer method should throw an error if a name already exists",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    oakTestDp.addSerializer('serializer1', (userInfo: string) => 1);
    assertThrows(() => oakTestDp.addSerializer('serializer1', (userInfo: string) => 2));
  }
})

Deno.test({
  name: "removeSerializer method should throw an error if a name does not exist",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    oakTestDp.addSerializer('serializer1', (userInfo: string) => 1);
    assertThrows(() => oakTestDp.removeSerializer('serializer2'));
  }
})

Deno.test({
  name: "removeSerializer method should throw an error if trying to remove a Serializer twice",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    oakTestDp.addSerializer('serializer1', (userInfo: string) => 1);
    oakTestDp.removeSerializer('serializer1');
    assertThrows(() => oakTestDp.removeSerializer('serializer1'));
  }
})

//DESERIALIZER TESTS
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

//STRATEGY TESTS
Deno.test({
  name: "addStrategy method should throw an error if a name already exists",
  fn(): void {
    const oakTestDp = new Dashport('oak');
    class TestStrat{
      async router(ctx:any) {
        return 'test'
      }
    }

    oakTestDp.addStrategy('Strategy1', new TestStrat());
    assertThrows(() => oakTestDp.addStrategy('Strategy1', new TestStrat()));
  }
})

Deno.test({
  name: "removeStrategy method should throw an error if a name does not exist",
  fn(): void {
    const oakTestDp = new Dashport('oak');

    class TestStrat{
      async router(ctx:any) {
        return 'test'
      }
    }

    oakTestDp.addStrategy('Strategy1', new TestStrat());
    assertThrows(() => oakTestDp.removeStrategy('Strategy2'));
  }
})

Deno.test({
  name: "removeStrategy method should throw an error if trying to remove a Strategy twice",
  fn(): void {
    const oakTestDp = new Dashport('oak');
    class TestStrat{
      async router(ctx:any) {
        return 'test'
      }
    }

    oakTestDp.addStrategy('Strategy1', new TestStrat());
    oakTestDp.removeStrategy('Strategy1');
    assertThrows(() => oakTestDp.removeStrategy('Strategy1'));
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