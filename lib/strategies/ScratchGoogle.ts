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
    // preStep1 request permission 
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
    // GO_Step 1 Request Permission
    if(!ctx.request.url.search) return await this.authorize(ctx, next);
    // GO_Step 2-3 Exchange code for Token
    if(ctx.request.url.search.slice(1, 5)=== 'code') return this.getAuthToken(ctx, next);
    // if(ctx.state._dashport.coolio===true) await dashport._sm(ctx, next);
  }
  
  // sends the programatically constructed uri to Google's oauth 2.0 server (step 2)
  async authorize(ctx: OakContext, next: any) {
    console.log('in GoogleStrategy.authorize');
    return await ctx.response.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + this.uriFromParams);                   
  }

  // 4%2F0AY0e-g6vCsnt5Gwl8ZyRJibp-CsWF93_0LH0r6J0aGHS8pWDkYm29y-J4mrxEM8HqCopEQ
  // 4%2F0AY0e-g6vCsnt5Gwl8ZyRJibp-CsWF93_0LH0r6J0aGHS8pWDkYm29y-J4mrxEM8HqCopEQ
  // handle oauth 2.0 server response (step 4)
  // sample error response: https://oauth2.example.com/auth?error=access_denied
  // sample auth code response: https://oauth2.example.com/auth?code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7
  async getAuthToken(ctx:any, next:Function){
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
    const code: string = this.parseCode(URI2[0]);
    const options:object = {
      method: 'POST',
      headers: { "content_type": "application/x-www-form-urlencoded"},
      body: JSON.stringify({
        client_id: this.options.client_id,
        client_secret: this.options.client_secret,
        code: code,
        grant_type: this.options.grant_type,
        redirect_uri: this.options.redirect_uri
      })
    } 
    //   method:'POST', 
    //   headers:{'Authorization': 'Basic ' + BasicKey, "Content-Type": "application/x-www-form-urlencoded"}, 
    //   body: `code=${code}&redirect_uri=${redirect_uri}&grant_type=authorization_code` 
    // return await fetch('https://oauth2.googleapis.com/token', options)
    //   .then(data => data.json())
    //   .then(parsed => this.getAuthData(parsed))
    //   .catch(err => {
    //     console.log('error: line 141 of scratchGoogle'+ err)
    //   });

    try {
      let data: any = await fetch('https://oauth2.googleapis.com/token', options)
      data = await data.json();
      return this.getAuthData(data);
    } catch(err) {
      console.log('error: line 141 of scratchGoogle'+ err)
    }
  }

  async getAuthData(parsed:any){ 
    // const token: string = parsed['id_token']
    const authData:any = { tokenData:{ access_token: parsed.access_token, expires_in: parsed.expires_in, scope: parsed.scope, token_type:parsed.token_type, id_token:parsed.id_token}}    ////// ALEX ASKS FOR BETTER TYPING
    const options:any = {headers:{'Authorization':'Bearer '+parsed.access_token}};
    // fetch('https://www.googleapis.com/oauth2/v2/userinfo',options)
    //   .then(parsed => parsed.json())
    //   .then(reallyParse => {
    //     authData.userInfo = reallyParse
    //     console.log('Scratch149', authData.userInfo);
    //     return authData;
    //   });

    try {
      let data: any = await fetch('https://www.googleapis.com/oauth2/v2/userinfo',options)
      authData.userInfo = await data.json();
      console.log('Scratch149', authData.userInfo);
      return authData;
    } catch(err) {
      console.log('error on line 165', err);
    }
  }

  parseCode(encodedCode:string):string{
    let code: string = encodedCode;
    const replacements: { [name: string] : string } = {
      "%24": "$",
      "%26": "&",
      "%2B": "+",
      "%2C": ",",
      "%2F": "/",
      "%3A": ":",
      "%3B": ";",
      "%3D": "=",
      "%3F": "?",
      "%40": "@"
    }
    const toReplaceArray: string[] = Object.keys(replacements);
    for(let i = 0; i < toReplaceArray.length; i++){
      while(encodedCode.includes(toReplaceArray[i])){
        encodedCode = encodedCode.replace(toReplaceArray[i], replacements[toReplaceArray[i]]);
      }
    }
    return encodedCode; 
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
