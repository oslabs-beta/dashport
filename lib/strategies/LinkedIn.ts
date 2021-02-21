import { OakContext, LinkedInOptions, LinkedInAuthData } from '../types.ts';
/**
 * 788zz8dnnxjo4s
 * FHhQQW3BaNQCFilA
 * 
 * Creates an instance of `LinkedInStrategy`.
 * 
 *
 * * Options:
 *
 *   - client_id: string                  Required
 *   - client_secret: string              Required
 *   - redirect_uri: string               Required
 *
 */
export default class LinkedInStrategy {
  name: string = 'linkedIn'
  options: LinkedInOptions;
  uriFromParams: string;
  authURL: string;
  tokenURL: string;
  /**
   * @constructor
   * @param {Object} options
   * @api public
   */
  constructor (options: LinkedInOptions) {
    if (!options.client_id || !options.redirect_uri || !options.scope || !options.client_secret || !options.response_type) {
      throw new Error('Missing required arguments');
    }

    this.options = options;
    this.authURL = 'https://www.linkedin.com/oauth/v2/authorization?'
    this.tokenURL = 'https://www.linkedin.com/oauth/v2/accessToken'
    this.uriFromParams = this.constructURI(this.options, 'client_secret');
  }

  constructURI(options:any, skip?:string): any{
    let paramArray: string[][] = Object.entries(options);
    let paramString: string = '';

    for (let i = 0; i < paramArray.length; i++) {
      let [key, value] = paramArray[i];

      if (key === skip) continue;
      paramString += (key + '=');
      paramString += (value + '&');
    }
    if(paramString[paramString.length - 1] === '&'){
      paramString = paramString.slice(0, -1);
    }
    console.log(paramString)
    return paramString;
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

  async router(ctx: OakContext, next: any) {
    if(!ctx.request.url.search) {
      console.log('hit before')
      return await this.authorize(ctx, next);
    }
    if(ctx.request.url.search.slice(1, 5)=== 'code') {
      console.log('hit after')
      return this.getAuthToken(ctx, next);
    }
  }
  
  async authorize(ctx: OakContext, next: any) {
    return await ctx.response.redirect(this.authURL + this.uriFromParams);                   
  }

  async getAuthToken(ctx: OakContext, next: any) {
    const OGURI: string = ctx.request.url.search;
    console.log('OGUR *********', OGURI)
    if (OGURI.includes('error')) {
      console.log('broke the code again');
    }

    let URI1: string[] = OGURI.split('=');
    const URI2: string[] = URI1[1].split('&');
    const code: string = this.parseCode(URI2[0]);
    const options: any = {
      method: 'POST',
      headers: { 'Content-Type': "x-www-form-urlencoded" },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.options.client_id,
        client_secret: this.options.client_secret,
        code: code,
        redirect_uri: this.options.redirect_uri,
      })
    }

    try {
      let data: any = await fetch(this.tokenURL, options);
      
      data = await data.json();
      // console.log('THIS BE DATAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', data)
      return this.getAuthData(data);
    } catch(err) {
      return new Error(`ERROR: ${err}`);
    }
  }

  async getAuthData(parsed: any){ 
    const authData: LinkedInAuthData = { 
      tokenData: {
        access_token: parsed.access_token,
        expires_in: parsed.expires_in,
        token_type: parsed.token_type,
        id_token: parsed.id_token,
        scope: parsed.scope,
      }
    };
    const options: any = {
      headers: { 'Authorization': 'Bearer '+ parsed.access_token }
    };

    try {
      let data: any = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', options);
      data = await data.json();

      authData.userInfo = {
        provider: 'linkedin',
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
}
