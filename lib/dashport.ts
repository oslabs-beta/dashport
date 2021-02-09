import { OakContext, Serializers } from './types.ts';
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
  private _strategies: any = {};
  private _serializers: Serializers = {};
  public initialize: Function;

  constructor(framework: string) {
    this.initialize = this._initializeDecider(framework, this);
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
  _initializeDecider(framework: string, dashport: Dashport): Function {
    if (framework === 'oak') {
      return async (ctx: OakContext, next: Function) => {
        try {
          if (!ctx.state) {
            console.log('There is no state on ctx');
            throw new Error('Please use dashport.initialize() in app.use()');
          }

          // create the _dashport attribute on ctx.state
          ctx.state._dashport = {};
          // not sure if below is needed but passport does it
          ctx.state._dashport.instance = dashport;
          // do we need ctx.state.session???
          // only have ctx.state._dashport.session
          if (ctx.state.session && ctx.state.session.userId) {
            
          }

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
   * method: authenticate
   * the actual authenticate function (in Authenticate.ts) redirects
   * the user to log in with OAuth. This function give the client access
   * to a version of that function tailored to their strategy and framework
   * @param: strategyName
   * @param: options (tokens and keys needed for OAuth)
   */
  authenticate(strategyName: string, dashport: Dashport): void {
    // Authenticate(strategyName, this);
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
  addSerializer(serializerName: string, serializer: Function): void {
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
  removeSerializer(serializerName: string): void {
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
  addStrategy(stratName: string, strategy: Function): void {
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
  removeStrategy(stratName: string): void {
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
  getUserInfo(ctx: OakContext, idToCompare: string) {
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
