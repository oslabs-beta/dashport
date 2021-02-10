import OakContext from '../types.ts';

class Strategy {
  // below method only works with Oak framework
  authorize(ctx: OakContext, next: any) {
    // Write code here for strategy's OAuth logic
  }
}

export default Strategy;
