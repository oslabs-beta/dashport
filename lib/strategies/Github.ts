import { OakContext, GitHubOptions, GHAuthData } from '../types.ts';

/** 
 * Create an instance of 'GitHubStrategy'.
 *
 * * Options:
 *
 *   - client_id: string                  Required
 *   - redirect_uri: string               Required
 *   - client_secret: string              Required
 *
 *                                     reference: https://docs.github.com/en/developers/apps/authorizing-oauth-apps
*
* 
*
*
*/

export default class GitHubStrategy {
  name: string = 'github'
  options: GitHubOptions; // the options makes up the uriFromParams
  uriFromParams: string; // wh: does github 
  authURL: string;
  tokenURL: string;
  authDataURL: string;
  /**
   * @constructor
   * @param {Object} options
   * @api public 
   */
  constructor (options: GitHubOptions) {
    // customize required/desired field for the first redirect
    if (!options.client_id || !options.redirect_uri || !options.client_secret) {
      throw new Error('Mssing Required arguments');
    }
    
    this.options = options; 
    // ACTION NEEDED:
      // input url for first endpoint from service below: 
    this.authURL = 'https://github.com/login/oauth/authorize?'
      // add the url to exchange the auth code for a token here
    this.tokenURL = 'https://github.com/login/oauth/access_token?'
      // add the url to exchange the token for auth data here
    this.authDataURL = 'https://api.github.com/user?'

    // PRE STEP 1: 
      // Constructs the second half of the authURL for your first endpoint from the info you put into 'options'
    // ACTION NEEDED: 
      // If there are any variables in options that aren't needed for your first endpoint (but will be needed later), 
      // add them as an array of strings (even if there's only 1 item)
    this.uriFromParams = this.constructURI(this.options);
  } 

  //*************************************/
  constructURI(options:any, skip?:string[]): any{
    let paramArray: string[][] = Object.entries(options);
    let paramString: string = '';

    for (let i = 0; i < paramArray.length; i++) {
      let [key, value] = paramArray[i];
      
      if (skip && skip.includes(key)) continue;
      // adds the key and '=' for every member of options not in the skip array
      paramString += (key + '=');
      // adds the value and '&' for every member of options not in the skip array
      paramString += (value + '&');
    }
    // removes the '&' we just placed at the end of the string
    if(paramString[paramString.length - 1] === '&'){
      paramString = paramString.slice(0, -1);
    }
    console.log("0.5 paramString:", paramString);
    return paramString;
  }
     
  // parseCode func parses an encoded URI  
  parseCode(encodedCode: string): string {
    
    const decodedString: { [name: string] : string } = {
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

    const toReplaceArray: string[] = Object.keys(decodedString);
    // console.log('encoded code (fb 172)', encodedCode);
    for(let i = 0; i < toReplaceArray.length; i++) {
      while (encodedCode.includes(toReplaceArray[i])) {
        encodedCode = encodedCode.replace(toReplaceArray[i], decodedString[toReplaceArray[i]]);
      }
    }
    return encodedCode; 
  }

  //*************************************/
  // ENTRY POINT
  async router(ctx: OakContext, next: any) {
    // DEBUGGING: 
    console.log('0.9 url returned from auth request in ctx.request.url.search:', ctx.request.url.search)
    // GO_Step 1 Request Permission
    if(!ctx.request.url.search) return await this.authorize(ctx, next);
    // GO_Step 3 Exchange code for Token
    // ?ACTION REQUIRED: verify that a successful response from getAuthToken includes 'code' in the location specified below
    
    if(ctx.request.url.search.slice(1, 5)=== 'code') {
      console.log("1.0 line 116 we got the code!");
      return this.getAuthToken(ctx, next)};
    // if(ctx.request.url.search.slice) -- error
  }
  
  // STEP 1: sends the programatically constructed uri to an oauth 2.0 server
  async authorize(ctx: OakContext, next: any) {
    console.log("1.0 we are In authorize!");
    // ! this
    return await ctx.response.redirect(this.authURL + this.uriFromParams);                   
  }
  
  //**************** getAuthToken *********************/
  // STEP 2: /what happen before client choose/client choose yes or no
  // STEP 3: /who handles it?/handle oauth 2.0 server response containing auth code
  // STEP 3.5: request access token in exchange for auth code
  async getAuthToken(ctx: OakContext, next: any) {
    // the URI send back to the endpoint you provided in step 1
    const OGURI: string = ctx.request.url.search;

    if (OGURI.includes('error')) {
      // do error handling
      console.log('broke the code again');
    }

   
    // ACTION REQUIRED: verify that this function works for the format of the response you received. uncomment the line below to test:
      // console.log('authorize response: ', OGURI);
    // splits the string at the '=,' storing the first part in URI1[0] and the part we want in URI1[1]
    let URI1: string[] = OGURI.split('=');
    // splits the string at the ampersand(&), storing the string with the access_token in URI2[0] 
    // and the other parameters at URI2[n]
    const URI2: string[] = URI1[1].split('&');
    // console.log('uri on line 99', URI2[0])
    // PARSE THE URI
    const code: string = this.parseCode(URI2[0]);
    console.log("1.5 UR1:", URI1);
    console.log("1.5 UR2:", URI2);
    console.log("1.5 the code is:", code);
    // STEP 3.5
    // ACTION REQUIRED: add or remove the parameters needed to send your token request

    const tokenOptions: any = {
      client_id: this.options.client_id,
      client_secret: this.options.client_secret,
      code: code,
      redirect_uri: this.options.redirect_uri,
    }

    // SEND A FETCH REQ FOR TOKEN
    try {
      // DEBUGGING 
      console.log('2.0 url-sent-to-request-token, tokenOptions are: ', tokenOptions)
      const options: any = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tokenOptions
          // authentication: this.tokenURL+this.constructURI(tokenOptions)
        )
      };

      let data: any = await fetch('https://github.com/login/oauth/access_token', options);
      console.log('2.1 Line 177 Github data status', data.status);
      data = await data.json();
      if (data.type === 'oAuthException') return console.log('token request threw oauth exception')
      console.log('2.1 line178', data);

      // DEBUGGING 
      if (data.type === 'oAuthException') return console.log('token request threw oauth exception')
      // PASSES TOKEN ON TO STEP 4
      return this.getAuthData(data);
    } catch(err) {
      console.log('2.3 Line 207 Fetch Req For Token Error MESSAGE : '+ err)
    }
  }

  //*************** getAuthData **********************/

  // STEP 4 get the access token from the returned data
  // STEP 4.5 exchange access token for user info
  async getAuthData(parsed: any){ 
    // ACTION REQUIRED: 
      // fill in the fields for tokenData based on the token obj you got back in the last step
      // authData is what we're going to be passing back to dashport.ts
    const authData: GHAuthData = {
      tokenData: {
        access_token: parsed.access_token,
        scope: parsed.scope,
        token_type: parsed.token_type,
        }
    }

    // STEP 4.5: request user info
    // ACTION REQUIRED: 
      // fill in the fields for auth options with whatever information is required by your OAuth service
      // authOptions constructs the uri for your final fetch request
    // const authOptions: any = {
    //   input_token: authData.tokenData.access_token,
    //   access_token: this.options.client_id + '|' + this.options.client_secret
    // };
    console.log('line 235');
    
    // DEBUGGING: console.log('uri being used line 137', 'this.authDataUrl' + this.constructURI(authOptions))
    try {
      const authOptions: any = {
        headers: {
          'Authorization': `token ${authData.tokenData.access_token}`
        },
      };
      let data: any = await fetch('https://api.github.com/user', authOptions);
      data = await data.json();
      // DEBIGGING 
      console.log('auth data returned: ', data);
      // ACTION REQUIRED:
        // Add whatever data you requested and want to pass back to dashport.ts here
      authData.userInfo = {
        provider: this.name,
        providerUserId: data.id,
        displayName: data.login,
        name: {
          familyName: data.name,
        },
        emails: [data.email]
      };

      return authData;
    } catch(err) {
      console.log('3.4 L.252 getAuthData fetch error', err);
    }
  }
}

