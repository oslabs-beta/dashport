import { OakContext, Translators, Strategies } from './types.ts';
import SessionManager from './sessionManager.ts';

class Dashport {
  private _serializers: Translators = {};
  private _deserializers: Translators = {};
  private _strategies: Strategies = {};
  private _framework: string;
  private _sm: SessionManager;
  // public since _sId needs to be accessed by SessionManager but _ since a
  // developer should not access it
  public _sId: string = '';
  public initialize: any;
  // Note to help clear any confusion - the purpose of deserialize is NOT to
  // remove the serializedId. High-level explanation:
  //   serialize takes in user info and outputs a serializedId
  //   deserialize takes in a serializedId and outputs user info
  public deserialize: any;
  public logOut: Function;

  constructor(frmwrk: string) {
    frmwrk = frmwrk.toLowerCase();
    this._framework = frmwrk;
    this._sm = new SessionManager(frmwrk);
    this.logOut = this._sm.logOut;
    this.initialize = this._initializeDecider(frmwrk);
    this.deserialize = this._deserializeDecider(frmwrk);
    this.authenticate = this.authenticate.bind(this);
  }

  /**
   * Takes in a framework and returns a function that will become dashport's
   * initialize method. _initializeDecider runs inside the constructor of a new
   * Dashport instance.
   * 
   * TODO: Add other frameworks
   * 
   * @param {string} framework - The server framework that will be used
   * @returns {*} The async function that will be dashport's intialize method
   */
  private _initializeDecider(framework: string) {
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

    throw new Error('ERROR in constructor of Dashport: Name of framework passed in is not supported.');
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
   *   different strategy options for a particular route.
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
        console.log('dashport.ts_128: authData :', authData)

        if (authData !== undefined) {
          // serializedId will be obtained by calling SessionManager's serialize
          // function, which will invoke the serializer(s) the developer specified.
          // serializedId is type 'any' because lefthand side of instanceof must
          // be type 'any'
          const serializedId: any = self._sm.serialize(self._serializers, authData.userInfo);

          // if serializedId is an Error, throw it to be caught
          if (serializedId instanceof Error) throw serializedId;
          if (typeof serializedId !== 'string' && typeof serializedId !== 'number') {
            console.log('type of serializedId: ', typeof serializedId);
            throw new Error('ERROR in authenticate: serializedId returned from serializer must be a string or an Error.')
          }

          // use SessionManager's logIn method to create a session object on
          // ctx.state._dashport and to assign serializedId to the _sId property
          // of this instance of Dashport
          self._sm.logIn(ctx, self, serializedId);

          return await next();
        }
        else {
          console.log('dashport.ts_133: !we didn\'t get authData back')
        }
      }
    }

    throw new Error('ERROR in authenticate: Name of current framework is not supported.');
  }

  /**
   * Takes in a name for a serializer function and the serializer function the 
   * developer specifies. Serializer function needs to do 4 things below:
   * 
   * 1. The serializer function needs to take in one parameter which will be the
   * user data in the form of an object.
   * 2. The serializer function needs to specify what the developer wants to do
   * with the user data (store it somewhere, add some info to response body, 
   * etc).
   * 3. The serializer function should to specify how to create a serialized ID.
   * 4. The serializer function should return the serialized ID or an error.
   * 
   * EXAMPLE
   * 
   *   dashport.addSerializer('1', (userInfo) => { 
   *     const serializedId = Math.random() * 10000;
   * 
   *     try {
   *       // do something with userInfo like store in a database
   *       return serializedId;
   *     } catch(err) {
   *       // err should be an instance of 'Error'
   *       return err;
   *     }
   *   });
   * 
   * @param {string} serializerName - A name to give the serializer if it needs
   *   to be deleted later
   * @param {Function} serializer - The function that will create serialized IDs
   */
  public addSerializer(serializerName: string, serializer: Function): void {
    if (serializer.length !== 1) {
      throw new Error('ERROR in addSerializer: Serializer function must have 1 parameter that is the userInfo.');
    }

    // the below if statement is currently not needed. TODO in SessionManager.serialize method
    // if (serializerName === 'all') {
    //   throw new Error('ERROR in addSerializer: Cannot use the name \'all\'. It is a reserved keyword Dashport uses.')
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

    delete this._serializers[serializerName];
  }

  /**
   * Takes in a framework and returns a function that will become dashport's
   * deserialize method. _deserializeDecider runs inside the constructor of a
   * new Dashport instance.
   * 
   * dashport.deserialize will act as middleware and invoke the specified
   * deserializer(s) if the serialized ID on the session object matches the
   * serialized ID on the current instance of Dashport.
   * 
   * EXAMPLE: Using Oak as server framework
   * 
   * // Below code written in a dashport configuration file
   *   dashport.addDeserializer('A', (serializedId) => {
   *     // code code code
   *   })
   * 
   * // Below code written in a router file
   *   router.get('/iWantUserInfo',
   *     dashport.deserialize('A'),
   *     (ctx: OakContext, next: any) => {
   *       ctx.response.body = 'Data was deserialized in previous middleware';
   *     }
   *   )
   * 
   * TODO: Add other frameworks
   * 
   * TODO: Current deserialize method for Oak uses the first deserializer in
   * _deserializers. Extend code to take in an extra parameter (a name) that 
   * specifies which deserializer to use.
   * 
   * @param {string} framework - The server framework that will be used
   * @returns {*} The async function that will be dashport's deserialize method
   */
  private _deserializeDecider(framework: string) {
    const self: Dashport = this;

    if (framework === 'oak') {
      return async (ctx: OakContext, next: any) => {
        if (Object.values(self._deserializers).length === 0) {
          throw new Error('ERROR in deserialize: No deserializers.');
        }

        let userInfo: any;

        if (ctx.state._dashport.session === undefined) {
          userInfo = new Error('ERROR in deserialize: No session exists');
        } else if (self._sId === ctx.state._dashport.session) {
          // a deserializer should either return the user info in an object or
          // an Error
          userInfo = Object.values(self._deserializers)[0](ctx.state._dashport.session);
        } else {
          userInfo = new Error('ERROR in deserialize: serializedId cannot be authenticated');
        }

        // store the userInfo or the error in ctx.locals for next middleware to
        // access
        ctx.locals = userInfo;
        return await next();
      }
    }

    throw new Error('ERROR in _deserializeDecider: Name of current framework is not supported.');
  }

/**
   * Takes in a name for a deserializer function and the deserializer function
   * the developer specifies. Deserializer function needs to do 3 things below:
   * 
   * 1. The deserializer function needs to take in one parameter which will be
   * the serialized ID.
   * 2. The deserializer function needs to specify what the developer wants to
   * do with the serialized ID to obtain user info (e.g. fetch the userData from
   * a database).
   * 3. The deserializer function needs to return the user info or an Error.
   * 
   * EXAMPLE
   * 
   *   dashport.addDeserializer('A', (serializedId) => {
   *     // handle getting userInfo from a serializedId here. e.g. taking the ID
   *     // and querying a DB for the info. If userInfo comes back successfully,
   *     // return it. Otherwise return an error
   *     try {
   *       const userInfo = await (look up serializedId in a db here);
   *       return userInfo;
   *     } catch(err) {
   *       return err;
   *     }
   *   })
   * 
   * @param {string} deserializerName - A name to give the deserializer if it
   *   needs to be deleted later
   * @param {Function} deserializer - The function that will take a serialized ID
   *   and return the user info in an object or an Error
   */
  public addDeserializer(deserializerName: string, deserializer: Function): void {
    if (deserializer.length !== 1) {
      throw new Error('ERROR in addDeserializer: Deserializer function must have 1 parameter that is the serializedId.');
    }

    // the below if statement is currently not needed. TODO in Dashport._deserializeDecider method
    // if (deserializerName === 'all') {
    //   throw new Error('ERROR in addDeserializer: Cannot use the name \'all\'. It is a reserved keyword Dashport uses.')
    // }

    if (this._deserializers[deserializerName] !== undefined) {
      throw new Error('ERROR in addDeserializer: A deserializer with this name already exists.');
    }

    this._deserializers[deserializerName] = deserializer;
  }

  /**
   * Removes a deserializer from the this._deserializers object.
   * 
   * EXAMPLE
   * 
   *   dashport.removeDeserializer('A');
   * 
   * @param {string} deserializerName - The name of the serializer to remove
   */
  public removeDeserializer(deserializerName: string): void  {
    if (this._deserializers[deserializerName] === undefined) {
      throw new Error('ERROR in removeDeserializer: The specified deserializer does not exist.');
    }

    delete this._deserializers[deserializerName];
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
}

export default Dashport;
