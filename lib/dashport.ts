import { OakContext, Serializers, Strategies } from './types.ts';
/**
 * import Authenticate from Authenticate.ts
 */

/***** Some person that wants to use Dashport, in their server file, they would
****** do below

import { Dashport } from 'Our URL Here';

const dp = new Dashport('oak');

app.use(dp.initialize())

app.use(passport.initialize());
*/

class Dashport {
  private _serializers: Serializers = {};
  private _strategies: Strategies = {};
  private _framework: string;
  public initialize: Function;

  constructor(frmwrk: string) {
    this._framework = frmwrk;
    this.initialize = this._initializeDecider(frmwrk, this);
    this.authenticate = this.authenticate.bind(this);
  }

  // also checks to see if there is an existing session
  // onyx appends methods to the passed-in state, then checks for a userID and deserializes and returns their info

  /**
   * Takes in a framework and the current instance of dashport and returns a
   * function that will become dashport's initialize method. This method is run
   * inside the constructor of a new Dashport instance
   * 
   * @param {string} framework - The server framework that will be used
   * @param {Dashport} dashport - The current instance of dashport
   * @returns {Function} The function that will be dashport's intialize method
   */
  private _initializeDecider(framework: string, dashport: Dashport): Function {
    if (framework === 'oak') {
      return async (ctx: OakContext, next: any) => {
        try {
          if (!ctx.state) {
            console.log('There is no state on ctx');
            throw new Error('Please use dashport.initialize() in app.use()');
          }

          // // create the _dashport attribute on ctx.state
          // ctx.state._dashport = {};
          // // not sure if below is needed but passport does it
          // ctx.state._dashport.instance = dashport;
          // // do we need ctx.state.session???
          // // only have ctx.state._dashport.session
          // if (ctx.state.session && ctx.state.session.userId) {
            
          // }

          /******* From Passport - initialize.js
          return function initialize(req, res, next) {
            req._passport = {};
            req._passport.instance = passport;
        
            if (req.session && req.session[passport._key]) {
              // load data from existing session
              req._passport.session = req.session[passport._key];
            }
        
            next();
          };
          */

          await next();
        } catch(err) {
          await next(err);
        }
        // if (!ctx.state) {
        //   console.log('not ok')
        //   throw new Error('Please use onyx.initialize in app.use()');
        //   return;
        // }
        // await next();
      }
    }

    throw new Error('Name of framework passed in is not supported');
    // could have different closure functions for different frameworks, 
    // and we can return the invocation of whichever based on the clientStr
  }

  /**
   * Takes in a strategy name that should exist on this._strategies. The
   * strategy will need to be have been added by the developer.
   * 
   * Depending on the framework being used, authenticate returns an async
   * function that will serve as a middleware function.
   * 
   * EXAMPLE: Adding a strategy
   * 
   *   dashport.addStrategy('google', GoogleStrategy);
   * 
   * EXAMPLE: Using authenticate as a middleware in Oak
   * 
   *   router.get('/test',
   *     dashport.authenticate('google'),
   *     (ctx: OakContext, next: any) => {
   *       ctx.response.body = 'Hello World';
   *     }
   *   );
   * 
   * @param {string} strategyName - The name of a strategy that was added
   * @returns {Function} The middleware function (differs depending on server framework)
   */
  public authenticate(strategyName: string): Function {
    if (this._framework === 'oak') {
      // PART OF DEBATING IF NEEDED
      //   Authenticate should be checking URL to tell if
      //     1. logging in first time
      //     2. successful OAuth
      //     3. unsuccessful OAuth
      
      return async (ctx: OakContext, next: any) => {
        if (this._strategies[strategyName] === undefined) {
          // is ctx.throw the right way to handle an error?
          ctx.throw('This strategy name has not been specified for use');
        }

        // ALL strategies made for Dashport MUST have an 'authorize' method that
        // is a middleware
        if (this._strategies[strategyName].authorize === undefined) {
          // is ctx.throw the right way to handle an error?
          ctx.throw('This strategy does not have an \'authorize\' method');
        }

        await this._strategies[strategyName].authorize(ctx, next);
      }
    }
    // console.log('this._strategies in dashport.authenticate:', this._strategies);
    // await this._strategies['AlvinTest'].authorize(ctx, next);

    throw new Error('Name of current framework is not supported');
  }

  //////////////////////////// Used in '/test' route in server.tsx
  // async test(ctx: OakContext, next: any) {
  //   console.log('ctx.state._dashingportingtest in test:', ctx.state._dashingportingtest);
  //   await next();
  // }
  ///////////////////////////////////////////////////////////

  // PART OF DEBATING IF NEEDED
  public authCbHandler(strategyName: string) {
    if (this._framework === 'oak') {
    }

    throw new Error('Name of current framework is not supported');
  }

  /**
   * Takes in a function that the developer specifies. This function will be 
   * used to serialize IDs in this.authenticate
   * 
   * EXAMPLE
   * 
   *   dashport.addSerializer('1', () => { return Math.random() * 10000 })
   * 
   * @param {string} serializerName - A name to give the serializer if it needs
   *   to be deleted later
   * @param {Function} serializer - The function that will create serialized IDs
   */
  public addSerializer(serializerName: string, serializer: Function): void {
    if (this._serializers[serializerName] !== undefined) {
      throw new Error('A serializer with this name already exists');
    }
    
    this._serializers[serializerName] = serializer;
  }

  /**
   * Removes a serializer from the this._serializers object
   * 
   * EXAMPLE
   * 
   *   dashport.removeSerializer('1');
   * 
   * @param {string} serializerName - The name of the serializer to remove
   */
  public removeSerializer(serializerName: string): void {
    if (this._serializers[serializerName] === undefined) {
      throw new Error('The specified serializer does not exist');
    }
    
    delete this._strategies[serializerName];
  }

  /**
   * Adds an OAuth strategy that the developer would like to use
   * 
   * EXAMPLE
   * 
   *   dashport.addStrategy('google', GoogleStrategy());
   * 
   * @param {string} stratName - The name that will be used to reference this strategy
   * @param {Function} strategy - The imported OAuth strategy module to be used
   */
  public addStrategy(stratName: string, strategy: any): void {
    if (stratName === undefined || strategy === undefined) {
      throw new Error('A strategy name and a strategy must be provided');
    }
    
    this._strategies[stratName] = strategy;
  }

  /**
   * Removes an OAuth strategy from the _strategies attribute
   * 
   * EXAMPLE
   * 
   *   dashport.removeStrategy('google');
   * 
   * @param {string} stratName - The name of the strategy to be deleted
   */
  public removeStrategy(stratName: string): void {
    if (stratName === undefined) {
      throw new Error('A strategy name must be provided');
    }

    delete this._strategies[stratName];
  }
  
  /**
   * method: getUserInfo
   * @param: the serialized id that comes from serializeUser
   * @return: the user's information
   */
  public getUserInfo(ctx: OakContext, idToCompare: string) {
    if (ctx.state._dashport.session === undefined) {
      // There is no session, so person is not logged in, so redirect to login
    }

    const serializedId = ctx.state._dashport.session.userId;

    if (serializedId === idToCompare) {
      // nice go ahead grant access to secret stuff
    }

    // otherwise you are not the person so go away
  }
}

export default Dashport;
