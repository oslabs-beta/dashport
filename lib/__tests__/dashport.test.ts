import Dashport from '../dashport.ts';
import { assertEquals } from "https://deno.land/std@0.87.0/testing/asserts.ts"

Deno.test("hello world #1", () => {
  const x = 1 + 2;
  assertEquals(x, 3);
});