// Obtain OAuth 2.0 credentials of client key, client secret
// Obtain access token from Google Authorization Server
// Examine scopes of access granted by the user
// Send the access token to an API
// Refresh the access token, if necessary

//  https://developers.google.com/identity/protocols/oauth2/web-server#httprest_1

// GOOGS OAuth2.0
// Google's OAuth 2.0 endpoint is at https://accounts.google.com/o/oauth2/v2/auth.
//  This endpoint is accessible only over HTTPS. Plain HTTP connections are refused.

/**
 * Creates an instance of `GoogleStrategy`.
 *
 * * Options:
 *
 *   - `clientID`:string        identifies client to service provider - Required
 *   - redirect_uri:string      Required
 *   - response_type:string     Required
 *   - scope: string            Required
 *   - access_type: string      Recommended
 *   - state: string            Recommended
 *   - included_granted_access: string   Optional
 *   - login_hint: string       Optional
 *   - prompt: string           Optional
 *
 * Examples:
 *  
 *    update with a real example 
 * 
 *     dashport.use(new GoogleStrategy({
 *         authorizationURL: 'https://www.example.com/oauth2/authorize',
 *         tokenURL: 'https://www.example.com/oauth2/token',
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/example/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 */
interface googOptions {
  client_id:string; /*we do not supply this-----R*/ 
  redirect_uri:string; /*we do not supply this-----R*/
  response_type:string; /*we do not supply this-----R*/
  scope:string; /*we do not supply this------R*/
  access_type?:string; /*we do not supply this ------Recommend*/
  state?:string; /*we do not supply this------Reccomend*/
  included_granted_access?:string; /*we do not supply this**********OPTIONAL*/
  login_hint?:string;   /*we do not supply this**********OPTIONAL*/
  prompt?:string;       /*we do not supply this**********OPTIONAL*/
}
class GoogleStrategy {
  uriFromParams: string;
  client_id: string;
  client_secret: string;
  code: string;
  grant_type: string;
  redirect_uri: string;

  /**
   * @constructor
   * @param {Object} options
   * @param {Function} verify
   * @api public
   */
  constructor (options:googOptions, verify:Function) {
    if(!options.client_id || !options.redirect_uri || !options.response_type || !options.scope){
      // HANDLE ERROR -- missing required args
    }
    this.options = options;
    // CONSTRUCTS THE REDIRECT URI FROM THE PARAMETERS PROVIDED
    let paramArray: string[][] = Object.entries(options);
    for(let i = 0; i < paramArray.length; i++){
      let [key, value] = paramArray[i];
      key += '=';
      if(i < paramArray.length - 1){
        value += '&';
      }
    }
    this.uriFromParams = paramArray.join('');
  }
  
  async router(ctx, next) {
    // if no params - this.authorize
    // if "code" params - this.parseResponse
    // if "authcode" params - this.getAccessToken
  }
  
  // sends the programatically constructed uri to Google's oauth 2.0 server (step 2)
  async authorize(ctx, next) {
    await ctx.response.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + this.uriFromParams);
  }
  
  // handle oauth 2.0 server response (step 4)
  // sample error response: https://oauth2.example.com/auth?error=access_denied
  // sample auth code response: https://oauth2.example.com/auth?code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7
  async parseResponse(ctx, next){
    const OGURI: string = '';
    console.log(ctx.request);
    // splits the string at the question mark, storing the left half in URI1[0] and the half we want at URI1[1]
    let URI1: string[] = OGURI.split('?');
    // splits the string at the equals sign, storing the left half, which includes 'auth' or 'error' in URI2[0] 
    // and the half with the code or error message at URI2[1]
    const URI2: string[] = URI1[1].split('=');
    if(URI1[1].includes('auth')){
      // do error shit
    }
    else if(URI1.includes('error')){
      const code: string = URI2[1].split('/')[0]
      // prompt user to call swapForToken with the code and all the shit they need to add
      this.swapForToken(code);
    }
  }
  
  swapForToken(authCode){
    
  }
    /**
     *  exchange autorization code for refresh and access tokens (step 5)
     * To exchange an authorization code for an access token, 
     * call the https://oauth2.googleapis.com/token endpoint and set the following parameters:
        * client_id
        * client_secret
        * code
        * grant_type
        * redirect_uri
        * client_id.
     * SAMPLE REQ: 
     *    POST /token HTTP/1.1
          Host: oauth2.googleapis.com
          Content-Type: application/x-www-form-urlencoded

          code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7&
          client_id=your_client_id&
          client_secret=your_client_secret&
          redirect_uri=https%3A//oauth2.example.com/code&
          grant_type=authorization_code
     * 
     * Google responds to this request by returning a JSON object 
     * that contains a short-lived access token and a refresh token. 
     * Note that the refresh token is only returned if your application set the access_type parameter to offline
     * the response contains the following fields: 
     * access_token
     * expires_in
     * refresh_token
     * scope
     * token_type
     * sample: 
     * {
          "access_token": "1/fFAGRNJru1FTz70BzhT3Zg",
          "expires_in": 3920,
          "token_type": "Bearer",
          "scope": "https://www.googleapis.com/auth/drive.metadata.readonly",
          "refresh_token": "1//xEoDL4iW3cxlI7yDbSRFYNG01kVKM2C-259HOF2aQbI"
        }
    */
}


///redirect to 
/*https://accounts.google.com/o/oauth2/v2/auth?
  scope=https%3A//www.googleapis.com/auth/drive.metadata.readonly&
  access_type=offline&
  include_granted_scopes=true&
  response_type=code&
  state=state_parameter_passthrough_value&
  redirect_uri=https%3A//oauth2.example.com/code&
  client_id=client_id
*/

//with options 

// then returns with callback url with added token data
//${RedirectURI}#access_token=4/P7q7W91&token_type=Bearer&expires_in=3600
/*  access_token:string: 4/P7q7W91 
    token_type:string: 'Bearer'
    expires_in:number: 3600    
*/
