import { OakContext, SpotifyOptions, SpotifyAuthData} from '../types.ts';
import { Base64 } from '../../deps.ts';

/**
 * Creates an instance of `SpotifyStrategy`.
 * 
 * * Options:
 *
 *   -  client_id: string;
 *   -  response_type: string;
 *   -  redirect_uri: string;
 *   -  state: string;
 *   -  scope: string;
 *   -  client_secret: string;
 *
 */
export default class SpotifyStrategy {
  name: string = ''
  options: SpotifyOptions;
  uriFromParams: string;
  authURL: string;
  tokenURL: string;
  authDataURL: string;
  /**
   * @constructor
   * @param {Object} options
   * @api public
   */
  constructor (options: SpotifyOptions) {
    // customize with whatever fields are required to send your first redirect
    if (!options.client_id || !options.redirect_uri || !options.state || !options.client_secret) {
      throw new Error('Missing required arguments');
    }

    this.options = options;
    // ACTION NEEDED:
      // add the url for your first endpoint here
    this.authURL = 'https://accounts.spotify.com/authorize?'
      // add the url to exchange the auth code for a token here
    this.tokenURL = 'https://accounts.spotify.com/api/token?'
      // add the url to exchange the token for auth data here
    this.authDataURL = 'https://api.spotify.com/v1/me?'

    // PRE STEP 1: 
      // Constructs the second half of the authURL for your first endpoint from the info you put into 'options'
    // ACTION NEEDED: 
      // If there are any variables in options that aren't needed for your first endpoint (but will be needed later), 
      // add them as an array of strings (even if there's only 1 item)
    this.uriFromParams = this.constructURI(this.options, ['client_secret']);
  }

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
    return paramString;
  }

  // parses an encoded URI 
  parseCode(encodedCode: string): string {
    
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
    // console.log('encoded code (fb 172)', encodedCode);
    for(let i = 0; i < toReplaceArray.length; i++) {
      while (encodedCode.includes(toReplaceArray[i])) {
        encodedCode = encodedCode.replace(toReplaceArray[i], replacements[toReplaceArray[i]]);
      }
    }
    return encodedCode; 
  }

  // ENTRY POINT
  async router(ctx: OakContext, next: any) {
    // DEBUGGING: console.log('url returned from auth request', ctx.request.url.search)
    // GO_Step 1 Request Permission
    if(!ctx.request.url.search) return await this.authorize(ctx, next);
    // GO_Step 3 Exchange code for Token
    // ACTION REQUIRED: verify that a successful response from getAuthToken includes 'code' in the location specified below
    if(ctx.request.url.search.slice(1, 5)=== 'code') return this.getAuthToken(ctx, next);
    // if(ctx.request.url.search.slice) -- error
  }
  
  // STEP 1: sends the programatically constructed uri to an oauth 2.0 server
  async authorize(ctx: OakContext, next: any) {
    return await ctx.response.redirect(this.authURL + this.uriFromParams);                   
  }

  // STEP 2: client says yes or no

  // STEP 3: handle oauth 2.0 server response containing auth code
  // STEP 3.5: request access token in exchange for auth code
  async getAuthToken(ctx: OakContext, next: any) {
    // the URI sent back from the endpoint you provided in step 1
    const OGURI: string = ctx.request.url.search;
    // DEBUGGING: console.log('OGURI: ', OGURI)

    if (OGURI.includes('error')) {
      // do error handling
      console.log('broke the code again');
    }

    // EXTRACT THE AUTH CODE
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
    console.log('code:',code);

    // STEP 3.5
    // ACTION REQUIRED: add or remove the parameters needed to send your token request
    const bodyOptions = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.options.redirect_uri
    }
    const b64 = Base64.fromString(this.options.client_id + ':' + this.options.client_secret).toString();
    const tokenOptions: any = {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${b64}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: this.constructURI(bodyOptions)
    }

    // SEND A FETCH REQ FOR TOKEN
    try {
      // DEBUGGING 
      console.log('url sent to request token', this.tokenURL + tokenOptions.headers + tokenOptions.body)
      let data: any = await fetch(this.tokenURL, tokenOptions);
      console.log('data1: ', data)
      data = await data.json();
      console.log('data2: ', data)
      // DEBUGGING console.log('returned token obj', data);
      if (data.type === 'oAuthException') return console.log('token request threw oauth exception')
      // PASSES TOKEN ON TO STEP 4
      return this.getAuthData(data);
    } catch(err) {
      console.log('YOUR ERROR MESSAGE'+ err)
    }
  }

  // STEP 4 get the access token from the returned data
  // STEP 4.5 exchange access token for user info
  async getAuthData(parsed: any){ 
    // ACTION REQUIRED: 
      // fill in the fields for tokenData based on the token obj you got back in the last step
      // authData is what we're going to be passing back to dashport.ts
    const authData: SpotifyAuthData = {
      tokenData: {
        access_token: parsed.access_token,
        token_type: parsed.token_type,
        scope: parsed.scope,
        expires_in: parsed.expires_in,
        refresh_token: parsed.refresh_token
      }
    }

    // STEP 4.5: request user info
    // ACTION REQUIRED: 
      // fill in the fields for auth options with whatever information is required by your OAuth service
      // authOptions constructs the uri for your final fetch request
    const authOptions: any = {
      access_token: authData.tokenData.access_token,
      token_type: authData.tokenData.token_type,
      scope: authData.tokenData.scope,
      expires_in: authData.tokenData.expires_in,
      refresh_token: authData.tokenData.refresh_token,
    };
    // DEBUGGING: console.log('uri being used line 137', this.authDataUrl + this.constructURI(authOptions))
    try {
      let data: any = await fetch(this.authDataURL + this.constructURI(authOptions));
      data = await data.json();
      // DEBUGGING 
      console.log('auth data returned: ', data);
      // ACTION REQUIRED:
        // Add whatever data you requested and want to pass back to dashport.ts here
      authData.userInfo = {
        provider: this.name,
        providerUserId: data.id,
      };

      return authData;
    } catch(err) {
      console.log('getAuthData fetch error', err);
    }
  }
}