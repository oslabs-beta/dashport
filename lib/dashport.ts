import { OakContext, Serializers, Strategies } from './types.ts';
/**
 * import Authenticate from Authenticate.ts
 */

/***** Some person that wants to use Dashport, in their server file, they would
****** do below

import { Dashport } from 'Our URL Here';

const dp = new Dashport('oak');

app.use(dp.initialize())

*/
import SessionManager from './sessionManager.ts';

class Dashport {
  private _serializers: Serializers = {};
  private _strategies: Strategies = {};
  private _framework: string;
  private _sm: SessionManager;
  // public since _sId needs to be accessed by SessionManager but _ since a
  // developer should not access it
  public _sId: string;
  public initialize: Function;

  constructor(frmwrk: string) {
    this._sId = '';
    this._framework = frmwrk;
    this._sm = new SessionManager(frmwrk);
    this.initialize = this._initializeDecider(frmwrk, this);
    this.authenticate = this.authenticate.bind(this);
  }

  /**
   * Takes in a framework and the current instance of dashport and returns a
   * function that will become dashport's initialize method. This method is run
   * inside the constructor of a new Dashport instance.
   * 
   * TODO: Add other frameworks
   * 
   * @param {string} framework - The server framework that will be used
   * @param {Dashport} dashport - The current instance of dashport
   * @returns {Function} The function that will be dashport's intialize method
   */
  private _initializeDecider(framework: string, dashport: Dashport): Function {
    if (framework === 'oak') {
      return async (ctx: OakContext, next: any) => {
        if (ctx.state === undefined) {
          throw new Error('ERROR in initialize: \'state\' property needs to exist on context object of Oak.');
        }

        // if the _dashport property on ctx.state does not exist, create one.
        // ctx.state will persist across requests
        if (ctx.state._dashport === undefined) {
          ctx.state._dashport = {};
        }

        await next();
      }
    }

    throw new Error('ERROR constructing Dashport: Name of framework passed in is not supported.');
  }

  /**
   * Takes in a strategy name that should exist on this._strategies. The
   * strategy will need to be have been added by the developer.
   * 
   * Depending on the framework being used, authenticate returns an async
   * function that will serve as a middleware function.
   * 
   * In OAuth, there is a lot of back and forth communication between the
   * client, the app, and the OAuth provider, when a user begins a sign in to
   * the OAuth provider. Tokens are sent back and forth and user data gets sent
   * back at the end. The middleware function that is returned from the
   * 'authenticate' method bundles up this functionality by having multiple
   * checks to see what stage of the OAuth cycle the login process is in, and
   * executes code accordingly. This allows one method to be used for a seamless
   * OAuth process.
   * 
   * EXAMPLE: Adding a strategy
   * 
   *   dashport.addStrategy('google', GoogleStrategy);
   * 
   * EXAMPLE: Using dashport.authenticate as a middleware in Oak
   * 
   *   router.get('/test',
   *     dashport.authenticate('google'),
   *     (ctx: OakContext, next: any) => {
   *       ctx.response.body = 'Hello World';
   *     }
   *   );
   * 
   * TODO: Add optional parameter for options in case developers want to have
   *   different strategy options for a particular route
   * 
   * @param {string} stratName - The name of a strategy that was added
   * @returns {Function} The middleware function (differs depending on server framework)
   */
  public authenticate(stratName: string): Function {
    const self = this;

    if (this._strategies[stratName] === undefined) {
      throw new Error('ERROR in authenticate: This strategy name has not been specified for use.');
    }
    // ALL strategies made for Dashport MUST have an 'authorize' method that
    // is a middleware
    if (this._strategies[stratName].authorize === undefined) {
      throw new Error('ERROR in authenticate: This strategy does not have an \'authorize\' method.');
    }

    if (this._framework === 'oak') {

      return async (ctx: OakContext, next: any) => {

        // last and persistent step in 'authenticate' process
        //   Check if a session object exists (created by SessionManager.logIn
        //   in 2nd step)
        if (ctx.state._dashport) {   ///this breaks because you cannot check a key of an undefined object.  
          if (ctx.state._dashport.session === self._sId) {
            await next();
          }
  
          // 2nd step in 'authenticate' process
          //   If users are successfully authorized, Dashport strategies should add
          //   the user info onto its response. By checking to see if the userInfo 
          //   property exists on the res, we know the user has been authenticated
          if (ctx.request.body._dashport.userInfo) {
            const serializedId = self._serialize();
  
            // use SessionManager's logIn method to create a session object on
            // ctx.state._dashport and assign it the serialized ID
            self._sm.logIn(ctx, self, serializedId);
  
            await next();
          }
        }
        let authData:any = await this._strategies[stratName].router(ctx, next);
        console.log('142Dash', authData);
      }
    }
    // console.log('this._strategies in dashport.authenticate:', this._strategies);
    // await this._strategies['AlvinTest'].authorize(ctx, next);

    throw new Error('ERROR in authenticate: Name of current framework is not supported.');
  }

  //////////////////////////// Used in '/test' route in server.tsx
  async test(ctx: OakContext, next: any) {
   console.log('dashport 150', ctx.request.url.search)
    // console.log('ctx.state._dashingportingtest in test:', ctx.state._dashingportingtest);
    await next();
  }
  ///////////////////////////////////////////////////////////

  // PART OF DEBATING IF NEEDED
  // public authCbHandler(uri: string) {
  //   throw new Error('Name of current framework is not supported');
  // }

  /**
   * Takes in a function that the developer specifies. This function will be 
   * used to serialize IDs in this.authenticate.
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
    // the below if statement is currently not needed. TODO in _serialize method
    // if (serializerName === 'all') {
    //   throw new Error('ERROR in addSerializer: Cannot use the name \'all\'. It is a special keyword Dashport uses.')
    // }
    if (this._serializers[serializerName] !== undefined) {
      throw new Error('ERROR in addSerializer: A serializer with this name already exists.');
    }
    
    this._serializers[serializerName] = serializer;
  }

  /**
   * Removes a serializer from the this._serializers object.
   * 
   * EXAMPLE
   * 
   *   dashport.removeSerializer('1');
   * 
   * @param {string} serializerName - The name of the serializer to remove
   */
  public removeSerializer(serializerName: string): void  {
    if (this._serializers[serializerName] === undefined) {
      throw new Error('ERROR in removeSerializer: The specified serializer does not exist.');
    }
    
    delete this._strategies[serializerName];
  }

  /**
   * Uses the first serializer function in this._serializers to create a
   * serialized ID.
   * 
   * TODO: Allow a 'name' parameter to be passed in that specifies which
   * serializer to use. If name === 'all', use all the serializers in a chain.
   * 
   * TODO: Allow optional parameters to be passed into the serializer to be
   * used. If chaining multiple serializers is implemented, pass params into the
   * first serializer function.
   * 
   * @returns {string} A serialized ID
   */
  private _serialize(): string {
    // Object.values(this._strategies)[0] returns the first key/value pair's
    // value. We are then invoking it (since it should be a function) and
    // returning a serialized ID
    return Object.values(this._strategies)[0]();
  }

  /**
   * Adds an OAuth strategy that the developer would like to use.
   * 
   * EXAMPLE
   * 
   *   dashport.addStrategy('google', new GoogleStrategy());
   * 
   * @param {string} stratName - The name that will be used to reference this strategy
   * @param {Function} strategy - The imported OAuth strategy module to be used
   */
  public addStrategy(stratName: string, strategy: any): void {
    if (stratName === undefined || strategy === undefined) {
      throw new Error('ERROR in addStrategy: A strategy name and a strategy must be provided.');
    }

    this._strategies[stratName] = strategy;
  }

  /**
   * Removes an OAuth strategy from the _strategies attribute.
   * 
   * EXAMPLE
   * 
   *   dashport.removeStrategy('google');
   * 
   * @param {string} stratName - The name of the strategy to be deleted
   */
  public removeStrategy(stratName: string): void {
    if (stratName === undefined) {
      throw new Error('ERROR in removeStrategy: A strategy name must be provided.');
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

    const serializedId = ctx.state._dashport.session;

    if (serializedId === idToCompare) {
      // nice go ahead grant access to secret stuff
    }

    // otherwise you are not the person so go away
  }
}

export default Dashport;
