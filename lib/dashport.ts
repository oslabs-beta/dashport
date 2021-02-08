/*
* import Authenticate from Authenticate.ts
*/

class Dashport {
  /**
   * 'Dashport' constructor
   */
  public _strategies: any;

  constructor() {
    this._strategies = {}
  }

  /**
   * method: initialize
   */
  // needs to connect to framework (what exactly does that entail?)
  // also checks to see if there is an existing session
  // onyx appends methods to the passed-in state, then checks for a userID and deserializes and returns their info
  initialize(): any {
    return async (ctx: any, next: Function) => {
      if (!ctx.state) {
        console.log('not ok')
        throw new Error('Please use onyx.initialize in app.use()');
        return;
      }
      await next();
    }
    // could have different closure functions for different frameworks, 
    // and we can return the invocation of whichever based on the clientStr
  }

  /**
   * method: authenticate
   * the actual authenticate function (in Authenticate.ts) redirects
   * the user to log in with OAuth. This function give the client access
   * to a version of that function tailored to their strategy and framework
   * @param: strategyName
   * @param: options (tokens and keys needed for OAuth)
   */
  authenticate(strategyName: string){
    // perform the necessary logic to the authenticate method from authenticate.ts
  }
  
  /**
   * method: add
   * @param: stratName -- the name used to store the strategy in our strats array
   * @param: an invocation of the imported strategy; need to determine type
   */
  add(stratName: string, strategy: Function) {
    //if strategy is not passed in, throw Err
    if(!stratName || !strategy) console.log('use must be implemented with a key and strategy')
    // add the passed-in strategy object to the strategy array so it's available for 'authorize' to access
    this._strategies.stratName = strategy;
    return 'placeholder'
  }

  /**
   * method: unAdd
   * @param: the name of the strategy you want to remove
   */
  unAdd(stratName: string) {
    delete this._strategies.stratName
  }
  
  /**
   * method: getUserInfo
   * @param: the serialized id that comes from serializeUser
   * @return: the user's information
   */
  getUserInfo(serialId: number) {
    return '!'
  }

  /**
   * idek
   */
  // transformAuthInfo()
}

export default Dashport;