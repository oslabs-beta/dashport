// import Dashport from '../dashport';
import { OakContext, googOptions } from '../types.ts';

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
export default class GoogleStrategy {
  name: string = 'google'
  options: googOptions;
  uriFromParams:string;
  /**
   * @constructor
   * @param {Object} options
   * @param {Function} verify
   * @api public
   */
  constructor (options:googOptions, verify:Function) {
    if(!options.client_id || !options.redirect_uri || !options.response_type || !options.scope || !options.client_secret){
      // HANDLE ERROR
      // throw new Error('Missing required arguments');
      console.log('missing required args')
    }
    this.options = options;
    // CONSTRUCTS THE REDIRECT URI FROM THE PARAMETERS PROVIDED
    let paramArray: string[][] = Object.entries(options);
    let paramString: string = '';
    for(let i = 0; i < paramArray.length; i++){
      let [key, value] = paramArray[i];
      if(key === 'client_secret' || key === 'grant_type'){
        break;
      }
      paramString += (key + '=');
      if(i < paramArray.length - 1){
        paramString += (value + '&');
      }
      else{
        paramString += value;
      }
    }
    this.uriFromParams = paramString;
  }
  
  async router(ctx:any, next:any) {
    if(!ctx.request.url.search) await this.authorize(ctx, next);
    if(ctx.request.url.search.slice(1, 5)=== 'code') await this.parseResponse(ctx, next);
    // if(ctx.state._dashport.coolio===true) await dashport._sm(ctx, next);
  }
  
  // sends the programatically constructed uri to Google's oauth 2.0 server (step 2)
  async authorize(ctx: OakContext, next: any) {
    await ctx.response.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + this.uriFromParams);                   
  }

  //http://localhost:3000/?
  //code=4%2F0AY0e-g5PpXeDhrj6VoC4bm4rgNxNw_X1VkK141KE66xjRdtPeIk6w9POa4q_a52Cox4_NQ&
  // scope=email+openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&
  // authuser=0&
  // prompt=none
  
  // handle oauth 2.0 server response (step 4)
  // sample error response: https://oauth2.example.com/auth?error=access_denied
  // sample auth code response: https://oauth2.example.com/auth?code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7
  async parseResponse(ctx:any, next:Function){
    const OGURI: string = ctx.request.url.search;
    if(OGURI.includes('error')){
      // do error shit
      console.log('Damn it, Waye broke the code again');
    }
    // splits the string at the =, storing the first part in URI1[0] and the part we want in URI1[1]
    let URI1: string[] = OGURI.split('=');
    // splits the string at the ampersand(&), storing the string with the access_token in URI2[0] 
    // and the other parameters at URI2[n]
    const URI2: string[] = URI1[1].split('&');
    const code: string = URI2[0];
    // console.log('code: ', code);
    console.log("before the fetch breaks it, here's the code: ", code)
    const options:object = {
      method: 'POST',
      headers: { "content_type": "application/x-www-form-urlencoded"},
      body: {
        "client_id": this.options.client_id,
        "client_secret": this.options.client_secret,
        "code": code,
        "grant_type": this.options.grant_type,
        "redirect_uri": this.options.redirect_uri
      }
    }
    //   method:'POST', 
    //   headers:{'Authorization': 'Basic ' + BasicKey, "Content-Type": "application/x-www-form-urlencoded"}, 
    //   body: `code=${code}&redirect_uri=${redirect_uri}&grant_type=authorization_code` 
    await fetch('https://oauth2.googleapis.com/token', options)
      .then(data => {
        console.log('does the json break it?')
        data.json()
        console.log("let's see")
      })
      .then(parsed => {
        console.log('parsed137'+parsed);
        this.parseToken(parsed);
      })
      .catch(err => {
        console.log('error: line 145 of scratchGoogle'+ err)
      });
    // prompt user to call swapForToken with the code and all the shit they need to add
    // this.swapForToken(code);
  }
  
  async parseToken(parsed:any){ 
    console.log('146 butts');
  }
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
