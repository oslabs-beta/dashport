import Dashport from '../dashport.ts';
import { assertEquals, assertNotEquals, assertThrowsAsync } from '../../deps.ts';

class TestStrat {
  async router() {
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
    const oakTestDash = new Dashport('oak')
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
  name: "initialize should be the correct server middleware with whichever framework Dashport is instantiated with",
  fn(): void {
    const oakTestDash = new Dashport('oak');
    
    assertEquals(oakTestDash.initialize, async (ctx: ) => {

    })


  },
});


Deno.test({
  name: "addStrategy method should add a strategy to _strategies",
  fn(): void {
    const oakTestDash = new Dashport('oak');
    const fakeStrat = new TestStrat();

    assertEquals(oakTestDash[_strategies], {});
    oakTestDash.addStrategy('test', fakeStrat);
    assertEquals(oakTestDash[_strategies], { test: fakeStrat });
  },
});

Deno.test({
  name: "removeStrategy method should remove a strategy on _strategies",
  fn(): void {
    const oakTestDash = new Dashport('oak');

    assertEquals();
    oakTestDash.removeStrategy('test');

    assertEquals();
  },
});

Deno.test({
  name: "If a session object exists on ctx.state._dashport, authenticate method " + 
        "should compare the IDs and invoke next",
  fn(): void {
    const oakTestDash = new Dashport('oak');

    


  },
});

Deno.test({
  name: "If a session object does not exist on ctx.state._dashport, or IDs do not match, " + 
        "authenticate method should begin the authentication process",
  fn(): void {
    const oakTestDash = new Dashport('oak');

    


  },
});


Deno.test({
  name: "addSerializer method should add a serializer to _serializer",
  fn(): void {
    const oakTestDash = new Dashport('oak');

    oakTestDash.addSerializer('1', () => 1);
    assertEquals()


  },
});

Deno.test({
  name: "removeSerializer method should remove a serializer on _serializer",
  fn(): void {
    const oakTestDash = new Dashport('oak');

    oakTestDash.removeSerializer('1');
    assertEquals()


  },
});
