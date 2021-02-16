import { OakContext, FacebookOptions, AuthData } from '../types.ts';

/**
 * Creates an instance of `FacebookStrategy`.
 * 
 *
 * * Options:
 *
 *   - client_id: string                 identifies client to service provider - Required
 *   - client_secret: string              Required
 *   - redirect_uri: string               Required
 *   - state: string                      Required
 *   - response_type: string              O
 *   - scope: string                      O
 *
 * Examples:
 * 
 *     dashport.use(new FacebookStrategy({
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
export default class FacebookStrategy {
  name: string = 'facebook'
  options: FacebookOptions;
  uriFromParams: string;
  authURL: string;
  /**
   * @constructor
   * @param {Object} options
   * @api public
   */
  constructor (options: FacebookOptions) {
    if (!options.client_id || !options.redirect_uri || !options.state || !options.client_secret) {
      throw new Error('Missing required arguments');
    }

    this.options = options;
    this.authURL = 'https://www.facebook.com/v9.0/dialog/oauth?'

    // preStep1 request permission 
    // CONSTRUCTS THE REDIRECT URI FROM THE PARAMETERS PROVIDED
    let paramArray: string[][] = Object.entries(options);
    let paramString: string = '';

    for (let i = 0; i < paramArray.length; i++) {
      let [key, value] = paramArray[i];

      // adds the key and '=' for every member of options needed for this request 
      if (key === 'client_secret') continue;
      paramString += (key + '=');
      paramString += (value + '&');
    }

    this.uriFromParams = paramString;
    console.log(this.uriFromParams);
  }

  async router(ctx: OakContext, next: any) {
    console.log('url returned from auth request', ctx.request.url.search)
    // GO_Step 1 Request Permission
    if(!ctx.request.url.search) return await this.authorize(ctx, next);
    // GO_Step 2-3 Exchange code for Token
    if(ctx.request.url.search.slice(1, 5)=== 'code') return this.getAuthToken(ctx, next);
    // if(ctx.request.url.search.slice) -- error
  }
  
  // sends the programatically constructed uri to Google's oauth 2.0 server (step 2)
  async authorize(ctx: OakContext, next: any) {
    return await ctx.response.redirect(this.authURL + this.uriFromParams);                   
  }

  // handle oauth 2.0 server response (step 4)
  async getAuthToken(ctx: OakContext, next: any) {
    const OGURI: string = ctx.request.url.search;

    if (OGURI.includes('error')) {
      // do error handling
      console.log('broke the code again');
    }

    // splits the string at the =, storing the first part in URI1[0] and the part we want in URI1[1]
    let URI1: string[] = OGURI.split('=');
    // splits the string at the ampersand(&), storing the string with the access_token in URI2[0] 
    // and the other parameters at URI2[n]
    const URI2: string[] = URI1[1].split('&');
    const code: string = this.parseCode(URI2[0]);

    const options: any = {
      method: 'GET',
      headers: { 'content-type': "application/x-www-form-urlencoded" },
      body: JSON.stringify({
        client_id: this.options.client_id,
        redirect_uri: this.options.redirect_uri,
        client_secret: this.options.client_secret,
        code: code
      })
    }

    try {
      let data: any = await fetch('https://graph.facebook.com/v9.0/oauth/access_token?', options);
      data = await data.json();
      console.log('returned token obj', data);
      return this.getAuthData(data);
    } catch(err) {
      console.log('getAuthToken error on line 133 of scratchGoogle'+ err)
    }
  }

  async getAuthData(parsed: any){ 
    const authData: AuthData = { 
      tokenData: {
        access_token: parsed.access_token,
        expires_in: parsed.expires_in,
        scope: parsed.scope,
        token_type: parsed.token_type,
        id_token: parsed.id_token
      }
    };
    const options: any = {
      headers: { 'Authorization': 'Bearer '+ parsed.access_token }
    };

    try {
      let data: any = await fetch('//graph.facebook.com/v9.0/oauth/access_token?', options);
      data = await data.json();

      authData.userInfo = {
        provider: 'google',
        providerUserId: data.id,
        displayName: data.name,
        name: {
          familyName: data.family_name,
          givenName: data.given_name,
        },
        emails: [data.email]
      };

      return authData;
    } catch(err) {
      console.log('getAuthData error on line 153 of scratchGoogle', err);
    }
  }

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

    for(let i = 0; i < toReplaceArray.length; i++) {
      while (encodedCode.includes(toReplaceArray[i])) {
        encodedCode = encodedCode.replace(toReplaceArray[i], replacements[toReplaceArray[i]]);
      }
    }

    return encodedCode; 
  }
}
