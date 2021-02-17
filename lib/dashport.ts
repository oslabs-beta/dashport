import { OakContext, Serializers, Strategies } from './types.ts';
import SessionManager from './sessionManager.ts';

class Dashport {
  private _serializers: Serializers = {};
  private _strategies: Strategies = {};
  private _framework: string;
  private _sm: SessionManager;
  // public since _sId needs to be accessed by SessionManager but _ since a
  // developer should not access it
  public _sId: string = '';
  public initialize: any;

  constructor(frmwrk: string) {
    this._framework = frmwrk;
    this._sm = new SessionManager(frmwrk);
    this.initialize = this._initializeDecider(frmwrk);
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
   * @returns {Function} The async function that will be dashport's intialize method
   */
  private _initializeDecider(framework: string): Function {
    if (framework === 'oak') {
      return async (ctx: OakContext, next: any) => {
        if (ctx.state === undefined) {
          throw new Error('ERROR in initialize: \'state\' property needs to exist on context object of Oak. Use app.use(dashport.initialize) not app.use(dashport.initialize()).');
        }

        // if the _dashport property on ctx.state does not exist, create one.
        // ctx.state will persist across requests
        if (ctx.state._dashport === undefined) {
          ctx.state._dashport = {};
        }

        return await next();
      }
    }

    throw new Error('ERROR constructing Dashport: Name of framework passed in is not supported.');
  }

  /**
   * Takes in a strategy name that should exist on this._strategies. The
   * strategy will need to be have been added by the developer.
   * 
   * Authenticate returns an async function depending on the framework being
   * used, that will serve as a middleware function.
   * 
   * In OAuth, there is a lot of back and forth communication between the
   * client, the app, and the OAuth provider, when a user want to sign in.
   * Tokens are sent back and forth and user data gets sent back at the end. 
   * The middleware function that is returned from the 'authenticate' method 
   * bundles up this functionality by executing code depending if a user has
   * been authenticated or not. This allows one method to be used for a seamless
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
    const self: Dashport = this;

    if (this._strategies[stratName] === undefined) {
      throw new Error('ERROR in authenticate: This strategy name has not been specified for use.');
    }

    // ALL strategies made for Dashport MUST have a 'router' method that on
    // successful authentication, returns an authData object with a userInfo
    // property in the form of UserProfile
    if (this._strategies[stratName].router === undefined) {
      throw new Error('ERROR in authenticate: This strategy does not have a \'router\' method.');
    }

    if (this._framework === 'oak') {
      return async (ctx: OakContext, next: any) => {
        if (ctx.state._dashport === undefined) {
          throw new Error('ERROR in authenticate: Dashport needs to be initialized first with dashport.initialize().');
        }

        // check if a session object exists (created by SessionManager.logIn).
        // If it exists, check if the session ID matches. If it does, user has
        // already been authenticated, so user can go to next middleware
        if (ctx.state._dashport.session) {
          if (ctx.state._dashport.session === self._sId) {
            return await next();
          }
        }

        // if above check is not passed, user must be authenticated (again), so
        // call the requested strategy's 'router' method. authData must contain
        // a userInfo property in the form of UserProfile
        const authData: any = await self._strategies[stratName].router(ctx, next);
        console.log('authData on line 118 of dashport', authData)

        if (authData !== undefined) {
          // serializedId will be obtained by calling SessionManager's serialize
          // function, which will invoke the serializer(s) the developer specified
          const serializedId: string = self._sm.serialize(self._serializers, authData.userInfo);

          // use SessionManager's logIn method to create a session object on
          // ctx.state._dashport and to assign serializedId to the _sId property
          // of this instance of Dashport
          self._sm.logIn(ctx, self, serializedId);

          return await next();
        }
        else {
          console.log('we didn\'t get authData back (dash 133)')
        }
      }
    }

    throw new Error('ERROR in authenticate: Name of current framework is not supported.');
  }

  /**
   * Takes in a name for a serializer function and the serializer function the 
   * developer specifies. Serializer function needs to do 4 things below
   * 
   * 1. The serializer function needs to take in one parameter which will be the
   * user data in the form of an object.
   * 2. The serializer function needs to specify what the developer wants to do
   * with the user data (store it somewhere, add some info to response body, 
   * etc).
   * 3. The serializer function needs to specify how to create a serialized ID.
   * 4. The serializer function needs to return the serialized ID.
   * 
   * EXAMPLE
   * 
   *   dashport.addSerializer('1', (userInfo) => { 
   *     function getSerializedId () {
   *       return Math.random() * 10000;
   *     }
   * 
   *     const serializedId = getSerializedId();
   * 
   *     // do something with userInfo like store in a database
   * 
   *     return serializedId;
   *   });
   * 
   * @param {string} serializerName - A name to give the serializer if it needs
   *   to be deleted later
   * @param {Function} serializer - The function that will create serialized IDs
   */
  public addSerializer(serializerName: string, serializer: Function): void {
    if (serializer.length !== 1) {
      throw new Error('ERROR in addSerializer: Serializer function must have 1 parameter.');
    }

    // the below if statement is currently not needed. TODO in SessionManager.serialize method
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
   * --- Currently in process for configuring for Oak ---
   * 
   * Takes in a serialized ID and compares it to the _sId. If they match, allow
   * permission
   * 
   * TODO: Configure for other server frameworks
   * 
   * @param {Object} ctx - The Oak context object
   * @param {string} idToCompare - The ID to compare to _sId
   * @returns {} 
   */
  public getUserInfo(ctx: OakContext, idToCompare: string) {
    if (ctx.state._dashport === undefined) {
      throw new Error('ERROR in getUserInfo: Dashport must be initialized')
    }

    if (ctx.state._dashport.session === undefined) {
      // There is no session, so person is not logged in, so redirect to login
    }

    if (idToCompare === this._sId) {
      // nice go ahead grant access to secret stuff
    }

    // otherwise you are not the person so go away
  }
}

export default Dashport;
