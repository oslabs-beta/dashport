// // Load modules.
// var passport = require('passport-strategy')
//   , url = require('url')
//   , uid = require('uid2')
//   , crypto = require('crypto')
//   , base64url = require('base64url')
//   , util = require('util')
//   , utils = require('./utils')
//   , OAuth2 = require('oauth').OAuth2
//   , NullStateStore = require('./state/null')
//   , SessionStateStore = require('./state/session')
//   , PKCESessionStateStore = require('./state/pkcesession')
//   , AuthorizationError = require('./errors/authorizationerror')
//   , TokenError = require('./errors/tokenerror')
//   , InternalOAuthError = require('./errors/internaloautherror');


// /**
//  * Creates an instance of `OAuth2Strategy`.
//  *
//  * The OAuth 2.0 authentication strategy authenticates requests using the OAuth
//  * 2.0 framework.
//  *
//  * OAuth 2.0 provides a facility for delegated authentication, whereby users can
//  * authenticate using a third-party service such as Facebook.  Delegating in
//  * this manner involves a sequence of events, including redirecting the user to
//  * the third-party service for authorization.  Once authorization has been
//  * granted, the user is redirected back to the application and an authorization
//  * code can be used to obtain credentials.
//  *
//  * Applications must supply a `verify` callback, for which the function
//  * signature is:
//  *
//  *     function(accessToken, refreshToken, profile, done) { ... }
//  *
//  * The verify callback is responsible for finding or creating the user, and
//  * invoking `done` with the following arguments:
//  *
//  *     done(err, user, info);
//  *
//  * `user` should be set to `false` to indicate an authentication failure.
//  * Additional `info` can optionally be passed as a third argument, typically
//  * used to display informational messages.  If an exception occured, `err`
//  * should be set.
//  *
//  * Options:
//  *
//  *   - `authorizationURL`  URL used to obtain an authorization grant
//  *   - `tokenURL`          URL used to obtain an access token
//  *   - `clientID`          identifies client to service provider
//  *   - `clientSecret`      secret used to establish ownership of the client identifer
//  *   - `callbackURL`       URL to which the service provider will redirect the user after obtaining authorization
//  *   - `passReqToCallback` when `true`, `req` is the first argument to the verify callback (default: `false`)
//  *
//  * Examples:
//  *
//  *     passport.use(new OAuth2Strategy({
//  *         authorizationURL: 'https://www.example.com/oauth2/authorize',
//  *         tokenURL: 'https://www.example.com/oauth2/token',
//  *         clientID: '123-456-789',
//  *         clientSecret: 'shhh-its-a-secret'
//  *         callbackURL: 'https://www.example.net/auth/example/callback'
//  *       },
//  *       function(accessToken, refreshToken, profile, done) {
//  *         User.findOrCreate(..., function (err, user) {
//  *           done(err, user);
//  *         });
//  *       }
//  *     ));
//  *
//  * @constructor
//  * @param {Object} options
//  * @param {Function} verify
//  * @api public
//  */
interface oauthOptions {
  authorizationURL:string;
  tokenURL:string;
  clientID:string
  clientSecret:string;
  callbackURL:string;
  passReqToCallback:boolean;
  customHeaders:string;
  scope:string;
  scopeSeparator:string;
  pkce:boolean;
  sessionKey:string;
}

interface meta {
  authorizationURL:string;
  tokenURL:string;
  clientID:string;
}

interface error {
  
}

function OAuth2Strat( options:oauthOptions, verify:Function) {
  //make sure options exist

  if (!verify) { throw new TypeError('no callback')}
  if (!options.authorizationURL) { throw new TypeError('no authorization URL')}
  if (!options.tokenURL) { throw new TypeError('no token URL')}
  if (!options.clientID) { throw new TypeError('no client ID')}

  dashport.Strategy.call(this) ///pulling all current strategy data/methods onto this.  
  this.name = 'oauth2' //passing on strat type
  this._verify = verify; // passing on verify function

  //PASSPORT MENTIONS THIS IS "PROTECTED"
  this._oauth2 = new oAuth2(options.clientID, options.clientSecret, '', options.authorizationURL, options.tokenURL, options.customHeaders); //DENO MODE

  this._callbackURL = options.callbackURL;
  this._scope = options.scope;
  this._scopeSeparator = options.scopeSeparator || ' ';
  this._pkceMethod = (options.pkce === true ) ? 'S256' : options.pkce;
  this._key = options.sessionKey || ('oauth2:' + url.parse(options.authorizationURL).hostname); // url.parse is a node module need to see deno built in.

  /// OPTIONS.STORE PKCE key to be stored, if needed.    BELIEVE ALL OF THIS CAN BE SKIPPED
  // if ( options.store ) this._stateStore = options.store;
  // else {
  //   if (options.pkce) throw new TypeError('oauth2 requires true state when PKCE is enabled');
    // this._stateStore = new NullStateStore();  BELIEVE THIS IS NOT NEEDED
    // this._trustProxy = options.proxyl
    // this._passReqToCallback = options.passReqToCallbacl;
    // this._skipUserProfile = ( options.skipUserProfile === undefined ) ? false : options.skipUserProfile;
  // }

  // ******* FIGURE OUT INHERITANCE **********//
  util.inherits(OAuth2Strategy, passport.Strategy);
  // ******* FIGURE OUT INHERITANCE **********//

}



// /**
//  * DENO HAS OAUTH 2 that may be sufficient doesnt cover all types of authorization oauth2 oferr, but should be sufficient for google at least.
//  */
OAuth2Strat.prototype.authenticate = function( req:object, options:oauthOptions) { //  Make this more precise typing.
  const self = this;

  //mild error handling before request is sent;
  if ( req.query && req.query.error ){
    if(req.query.error === 'access_denied'){
      return this.fail({message: req.query.error_description});
    } else {
      // WE DON'T ACTUALLY HAVE AUTHORIZATIONERROR
      return this.error(new AuthorizationError(req.query.error_description, req.query.error, req.query.error_uri))
      // NEED ERROR HANDLING
    }
  }

  const callbackURL = options.callbackURL || this._callbackURL; // redirect URL
  if (callbackURL) {
    const parsed = url.parse(callbackURL)  ///AGAIN MAY NOT HAVE ACCESS TO A URL PARSER AND MAY NEED TO HAND TYPE
    if (!parsed.protocol) callbackURL = url.resolve(utils.originalURL(Req, { proxy: this._trustProxy}), callbackURL)  // AGAIN USES URL and UTIL TO AUTO CONSTRACT A URL THAT MAY HAVE BEEN SHORTENED.
  }

  const meta:meta = { // meta 
    authorizationURL: this._oauth2._authorizeUrl,
    tokenURL: this._oauth2._accessTokenUrl,
    clientID: this._oauth2._clientId
  }

  if ( req.query && req.query.code ) {  //IS REQ STILL GOOD?
    function loaded(err, ok, state) {
      if (err) return self.error(err);
      if (!ok) return self.fail(state, 403);
      const code:string = req.query.code;
      const params:object = self.tokenParams(options);  // define this object more specifically
      params.grant_types = 'authorization_code';
      if (callbackURL) params.redirect_uri = callbackURL;
      if (typeof ok === 'string') params.code_verifier = ok; 

      self._oauth2.getOAuthAccessToken( code, params, ( error:object, accessToken:string, refreshToken:string, params:string) => { // get OAuth Access Token
        if ( error ) return self.error(self._createOAuthError('Couldnt get Access Token', error));  //WONT WORK
        self._loadUserProfile(accessToken, (err:object, profile:object) => {
          if (err) return self.error(err)  // REPORT ERROR
          function verified( err:object, user:object, info:object = {}) {
            if (err) return self.error(err);
            if (!user) return self.fail(info);
            if (state) info.state = state;
            self.success(user, info);
          };
          try {
            if (self._passReqToCallback) {  /// chan t Req to CTX? 
              const funcParamsLength:number = self._verify.length;  ///CHECKING TO SEE HOW MANY PARAMETERS THE FUNCTION TAKES IN
              if (funcParamsLength === 6) self._verify(req, accessToken, refreshToken, params, profile, verified);
              else self._verify( req, accessToken, refreshToken, profile, verified);
            } else {
              const funcParamsLength:number = self._verify.length;
              if ( funcParamsLength === 5) self._verify( accessToken, refreshToken, params, profile, verified);
              else self._verify(accessToken, refreshToken, profile, verified);
            }
          } catch (err:object) {return self.error(err)};
        });
      });
   }
   const state:object = req.query.state;   /// mention of req now be CTX?
   try {
     const funcParamsLength:number = this._stateStore.verify.length;
     if (funcParamsLength === 4) this._stateStore.verifty(req, state, meta, loaded) // REQ ??
     else this._stateStore.verify(req, state, loaded);
   } catch (err) { return this.error(err)};
  }   else {
    const params:object = this.authorizationParams(options);
    params.response_type = 'code';
    if ( callbackURL ) params.redirect_uri = callbackURL;
    const scope:string = options.scope || this._scope;
    if (scope) {
      if (Array.isArray(scope)) scope = scope.join(this._scopeSeparator);
      params.scope = scope;
    }
    let verifier:string, challenge:string /// I DONT KNOW I THINK FUNCTION AND STRING -alex
    /******************************* THIS ALL MAY NOT BE NEEDED FOR GOOGLE */
    if (this._pkceMethod) { // pkce Proof Key for Code Exchange 
      verifier = base65url(crypto.pseudoRandomBytes(32));
      switch (this._pkceMethod) {
        case 'plain':
          challenge = verifier;
          break;
        case 'S256':
          challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
          break;
        default:
          return this.error(new Error('Unsupported code verifier transformation method: '+ this._pkceMethod));
      }
    
      params.code_challenge = challenge; 
      params.code_challenge_method = this._pkceMethod;
    }
    /******************************* THIS ALL MAY NOT BE NEEDED FOR GOOGLE */

    const state:object = options.state;
    if (state) {
      params.state = state;
      const parsed:object = url.parse(this._oauth2._authorizeUrl, true); // url.parse needs to be adjusted.
      utils.merge(parsed.query, params);
      parsed.query['client_id'] = this._oath2._clientId;
      delete parsed.search;
      const location:string = url.format(parsed);
      this.redirect(location);
    } else {
      function stored(err:object, state:object) {
        if (err) return self.error(err);
        if (state) params.state = state;
        const parsed = url.parse(self._oauth2._authorizeUrl, true);
        utils.merge(parsed.query, params);
        parsed.query['client_id'] = self._oauth2._clientId;
        delete parsed.search;
        const location:string = url.format(parsed);
        self.redirect(location);
      }
      try { 
        const funcParamsLength:number = this._stateStore.store.length;
        if (funcParamsLength === 5) this._stateStore.store(req, verifier, undefined, meta, stored);
        if (funcParamsLength === 3) this._stateStore.store(req, meta, stored);
        else this._stateStore.store(req, stored);
      } catch (err) {return this.error(err)}
    }
  }
};

// /**
//  * Retrieve user profile from service provider.
//  *
//  * OAuth 2.0-based authentication strategies can overrride this function in
//  * order to load the user's profile from the service provider.  This assists
//  * applications (and users of those applications) in the initial registration
//  * process by automatically submitting required information.
//  *
//  * @param {String} accessToken
//  * @param {Function} done
//  * @api protected
//  */
OAuth2Strat.prototype.userProfile = function(accessToken:string, done:Function) {
  return done(null, {});
};

// /**
//  * Return extra parameters to be included in the authorization request.
//  *
//  * Some OAuth 2.0 providers allow additional, non-standard parameters to be
//  * included when requesting authorization.  Since these parameters are not
//  * standardized by the OAuth 2.0 specification, OAuth 2.0-based authentication
//  * strategies can overrride this function in order to populate these parameters
//  * as required by the provider.
//  *
//  * @param {Object} options
//  * @return {Object}
//  * @api protected
//  */
OAuth2Strat.prototype.authorizationParams = function(options:oauthOptions) {
  return {};
};

// /**
//  * Return extra parameters to be included in the token request.
//  *
//  * Some OAuth 2.0 providers allow additional, non-standard parameters to be
//  * included when requesting an access token.  Since these parameters are not
//  * standardized by the OAuth 2.0 specification, OAuth 2.0-based authentication
//  * strategies can overrride this function in order to populate these parameters
//  * as required by the provider.
//  *
//  * @return {Object}
//  * @api protected
//  */
OAuth2Strat.prototype.tokenParams = function(options:oauthOptions) {
  return {};
};

// /**
//  * Parse error response from OAuth 2.0 endpoint.
//  *
//  * OAuth 2.0-based authentication strategies can overrride this function in
//  * order to parse error responses received from the token endpoint, allowing the
//  * most informative message to be displayed.
//  *
//  * If this function is not overridden, the body will be parsed in accordance
//  * with RFC 6749, section 5.2.
//  *
//  * @param {String} body
//  * @param {Number} status
//  * @return {Error}
//  * @api protected
//  */
OAuth2Strat.prototype.parseErrorResponse = function(body:object, status:number) {
  var json:object = JSON.parse(body);
  if (json.error) {
    return new TokenError(json.error_description, json.error, json.error_uri); //NO ERROR HANDLING
  }
  return null;
};

// /**
//  * Load user profile, contingent upon options.
//  *
//  * @param {String} accessToken
//  * @param {Function} done
//  * @api private
//  */
OAuth2Strat.prototype._loadUserProfile = function(accessToken, done) {
  const self = this;

  function loadIt() {
    return self.userProfile(accessToken, done);
  }
  function skipIt() {
    return done(null);
  }

  if (typeof this._skipUserProfile == 'function' && this._skipUserProfile.length > 1) {
    // async
    this._skipUserProfile(accessToken, function(err, skip) {
      if (err) { return done(err); }
      if (!skip) { return loadIt(); }
      return skipIt();
    });
  } else {
    const skip = (typeof this._skipUserProfile == 'function') ? this._skipUserProfile() : this._skipUserProfile;
    if (!skip) { return loadIt(); }
    return skipIt();
  }
};

// /**
//  * Create an OAuth error.
//  *
//  * @param {String} message
//  * @param {Object|Error} err
//  * @api private
//  */
OAuth2Strat.prototype._createOAuthError = function(message:string, err:object) {
  let errorObj:object;
  if (err.statusCode && err.data) {
    try {
      errorObj = this.parseErrorResponse(err.data, err.statusCode);
    } catch (_) {}
  }
  if (!errorObj) { errorObj = new InternalOAuthError(message, err); }
  return errorObj;
};


// // Expose constructor.
export default OAuth2Strat;