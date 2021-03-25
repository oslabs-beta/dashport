import { OakContext, StrategyOptions, AuthData } from '../types.ts';

/**
 * Creates an instance of `TemplateStrategy`.
 * 
 *
 * * Options:
 *
 *   - client_id: string                  Required
 *   - client_secret: string              Required
 *   - redirect_uri: string               Required
 *
 */
export default class TemplateStrategy {
  name: string = '';
  options: StrategyOptions;
  uriFromParams: string;
  // ACTION NEEDED:
  //   add the url for the first endpoint here
  authURL: string = ''
  //   add the url to exchange the auth code for a token here
  tokenURL: string = ''
  //   add the url to exchange the token for auth data here
  authDataURL: string = ''
  /**
   * @constructor
   * @param {Object} options
   * @api public
   */
  constructor (options: StrategyOptions) {
    // customize with whatever fields are required to send to first redirect
    if (!options.client_id || !options.redirect_uri || !options.client_secret) {
      throw new Error('ERROR in TemplateStrategy constructor: Missing required arguments');
    }

    this.options = options;

    // PRE STEP 1: 
      // Constructs the second half of the authURL for developer's first endpoint from the info put into 'options'
    // ACTION NEEDED: 
      // If there are any variables in options that aren't needed for developer's first endpoint (but will be needed later), 
      // add them as an array of strings (even if there's only 1 item)
    this.uriFromParams = this.constructURI(this.options);
  }

  constructURI(options: any, skip?: string[]): any {
    const paramArray: string[][] = Object.entries(options);
    let paramString: string = '';

    for (let i = 0; i < paramArray.length; i++) {
      let [key, value] = paramArray[i];

      if (skip && skip.includes(key)) continue;
      // adds the key and '=' for every member of options not in the skip array
      paramString += (key + '=');
      // adds the value and '&' for every member of options not in the skip array
      paramString += (value + '&');
    }

    // removes the '&' that was just placed at the end of the string
    if (paramString[paramString.length - 1] === '&') {
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

    for (let i = 0; i < toReplaceArray.length; i++) {
      while (encodedCode.includes(toReplaceArray[i])) {
        encodedCode = encodedCode.replace(toReplaceArray[i], replacements[toReplaceArray[i]]);
      }
    }

    return encodedCode; 
  }

  // ENTRY POINT
  async router(ctx: OakContext, next: any) {
    // GO_Step 1 Request Permission
    if (!ctx.request.url.search) return await this.authorize(ctx, next);
    // GO_Step 3 Exchange code for Token
    // ACTION REQUIRED: verify that a successful response from getAuthToken includes 'code' in the location specified below
    if (ctx.request.url.search.slice(1, 5) === 'code') return this.getAuthToken(ctx, next);
  }
  
  // STEP 1: sends the programatically constructed uri to an OAuth 2.0 server
  async authorize(ctx: OakContext, next: any) {
    return await ctx.response.redirect(this.authURL + this.uriFromParams);                   
  }

  // STEP 2: client says yes or no

  // STEP 3: handle OAuth 2.0 server response containing auth code
  // STEP 3.5: request access token in exchange for auth code
  async getAuthToken(ctx: OakContext, next: any) {
    // the URI sent back to the endpoint provided in step 1
    const OGURI: string = ctx.request.url.search;

    if (OGURI.includes('error')) {
      return new Error('ERROR in getAuthToken: Received an error from auth token code request.');
    }

    // EXTRACT THE AUTH CODE
    // ACTION REQUIRED: verify that this function works for the format of the response received. uncomment the line below to test:
      // console.log('AUTH RESPONSE:', OGURI);
    // splits the string at the '=,' storing the first part in URI1[0] and the part wanted in URI1[1]
    let URI1: string[] = OGURI.split('=');
    // splits the string at the '&', storing the string with the access_token in URI2[0] 
    // and the other parameters at URI2[n]
    const URI2: string[] = URI1[1].split('&');
    // PARSE THE URI
    const code: string = this.parseCode(URI2[0]);

    // STEP 3.5
    // ACTION REQUIRED: add or remove the parameters needed to send as response to token request
    const tokenOptions: any = {
      client_id: this.options.client_id,
      redirect_uri: this.options.redirect_uri,
      client_secret: this.options.client_secret,
      code: code,
    }

    // SEND A FETCH REQ FOR TOKEN
    try {
      let data: any = await fetch(this.tokenURL + this.constructURI(tokenOptions));
      data = await data.json();

      if (data.type === 'oAuthException') {
        return new Error('ERROR in getAuthToken: Token request threw OAuth exception.');
      }

      // PASSES TOKEN ON TO STEP 4
      return this.getAuthData(data);
    } catch(err) {
      return new Error(`ERROR in getAuthToken: Unable to obtain token - ${err}`);
    }
  }

  // STEP 4 get the access token from the returned data
  // STEP 4.5 exchange access token for user info
  async getAuthData(parsed: any){ 
    // ACTION REQUIRED: 
      // fill in the fields for tokenData based on the token obj obtained in the last step
      // authData is what is going to be passed back to dashport's authenticate method
    const authData: AuthData = {
      tokenData: {
        access_token: parsed.access_token,
        token_type: parsed.token_type,
        expires_in: parsed.expires_in,
      },
      userInfo: {
        provider: '',
        providerUserId: ''
      }
    }

    // STEP 4.5: request user info
    // ACTION REQUIRED: 
      // fill in the fields for auth options with the information required by requested OAuth service
      // authOptions constructs the uri for the final fetch request
    const authOptions: any = {
      input_token: authData.tokenData.access_token,
      access_token: this.options.client_id + '|' + this.options.client_secret
    };

    try {
      let data: any = await fetch(this.authDataURL + this.constructURI(authOptions));
      data = await data.json();

      // ACTION REQUIRED:
        // Add any data to pass back to dashport's authenticate method here
      authData.userInfo = {
        provider: this.name,
        providerUserId: data.data.user_id
      };

      return authData;
    } catch(err) {
      return new Error(`ERROR in getAuthData: Unable to obtain auth data - ${err}`);
    }
  }
}
