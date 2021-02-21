import { OakContext, GoogOptions, AuthData } from '../types.ts';

/**
 * Creates an instance of `GoogleStrategy`.
 *
 * * Options:
 *
 *   - `clientID`: string                 identifies client to service provider - Required
 *   - redirect_uri: string               Required
 *   - response_type: string              Required
 *   - scope: string                      Required
 *   - access_type: string                Recommended
 *   - state: string                      Recommended
 *   - included_granted_access: string    Optional
 *   - login_hint: string                 Optional
 *   - prompt: string                     Optional
 *
 * Examples:
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
  options: GoogOptions;
  uriFromParams:string;
  /**
   * @constructor
   * @param {Object} options
   * @api public
   */
  constructor (options: GoogOptions) {
    if (!options.client_id || !options.redirect_uri || !options.response_type || !options.scope || !options.client_secret) {
      throw new Error('Missing required arguments');
    }

    this.options = options;

    // preStep1 request permission 
    // CONSTRUCTS THE REDIRECT URI FROM THE PARAMETERS PROVIDED
    let paramArray: string[][] = Object.entries(options);
    let paramString: string = '';

    for (let i = 0; i < paramArray.length; i++) {
      let [key, value] = paramArray[i];

      if (key === 'client_secret' || key === 'grant_type') continue;

      paramString += (key + '=');

      if (i < paramArray.length - 1) paramString += (value + '&');
      else paramString += value;
    }

    this.uriFromParams = paramString;
  }

  async router(ctx: OakContext, next: any) {
    // GO_Step 1 Request Permission
    if (!ctx.request.url.search) return this.authorize(ctx, next);
    // GO_Step 2-3 Exchange code for Token
    if (ctx.request.url.search.slice(1, 5)=== 'code') return this.getAuthToken(ctx, next);
    // if (ctx.request.url.search.slice(1, 6)=== 'error')
    throw new Error('ERROR: Unable to login correctly');
  }
  
  // sends the programatically constructed uri to Google's oauth 2.0 server (step 2)
  async authorize(ctx: OakContext, next: any) {
    return await ctx.response.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + this.uriFromParams);                   
  }

  // handle oauth 2.0 server response (step 4)
  async getAuthToken(ctx: OakContext, next: any) {
    const OGURI: string = ctx.request.url.search;
    // splits the string at the =, storing the first part in URI1[0] and the part we want in URI1[1]
    let URI1: string[] = OGURI.split('=');
    // splits the string at the ampersand(&), storing the string with the access_token in URI2[0] 
    // and the other parameters at URI2[n]
    const URI2: string[] = URI1[1].split('&');
    const code: string = this.parseCode(URI2[0]);

    const options: any = {
      method: 'POST',
      headers: { 'content-type': "application/x-www-form-urlencoded" },
      body: JSON.stringify({
        client_id: this.options.client_id,
        client_secret: this.options.client_secret,
        code: code,
        grant_type: this.options.grant_type,
        redirect_uri: this.options.redirect_uri
      })
    }

    try {
      let data: any = await fetch('https://oauth2.googleapis.com/token', options);
      data = await data.json();
      
      return this.getAuthData(data);
    } catch(err) {
      return new Error(`ERROR: ${err}`);
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
      let data: any = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', options);
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
      return new Error(`ERROR: ${err}`);
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
