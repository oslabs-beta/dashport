import { OakContext, GoogOptions, AuthData } from '../types.ts';
/**
 * 788zz8dnnxjo4s
 * FHhQQW3BaNQCFilA
 * 
 * Creates an instance of `GoogleStrategy`.
 * 
 *
 * * Options:
 *
 *   - client_id: string                  Required
 *   - client_secret: string              Required
 *   - redirect_uri: string               Required
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
    if(!options.client_id || !options.redirect_uri || !options.response_type || !options.scope || !options.client_secret){
      throw new Error('Missing required arguments');
    }
    this.options = options;
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
    if(!ctx.request.url.search) return await this.authorize(ctx, next);
    if(ctx.request.url.search.slice(1, 5)=== 'code') return this.getAuthToken(ctx, next);
  }


  async authorize(ctx: OakContext, next: any) {
    console.log('in GoogleStrategy.authorize');
    return await ctx.response.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + this.uriFromParams);                   
  }

  async getAuthToken(ctx:any, next:Function){
    const OGURI: string = ctx.request.url.search;
    if(OGURI.includes('error')){
      console.log('broke the code again');
    }
    let URI1: string[] = OGURI.split('=');
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

    try {
      let data: any = await fetch('https://oauth2.googleapis.com/token', options)
      data = await data.json();
      console.log('THIS IS THE DATAAAAAAAAAAA', data)
      return this.getAuthData(data);
    } catch(err) {
      console.log('error: line 141 of scratchGoogle'+ err)
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
