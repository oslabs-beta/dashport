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
  uriFromParams:string;
  /**
   * @constructor
   * @param {Object} options
   * @api public
   */
  constructor (options: LinkedInOptions) {
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
    return await ctx.response.redirect('https://www.linkedin.com/oauth/v2/authorization?' + this.uriFromParams);                   
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
      headers: { "Content-Type": "x-www-form-urlencoded"},
      body: JSON.stringify({
        grant_type: this.options.grant_type,
        client_id: this.options.client_id,
        client_secret: this.options.client_secret,
        code: code,
        redirect_uri: this.options.redirect_uri
      })
    } 

    try {
      let data: any = await fetch(`https://www.linkedin.com/oauth/v2/accessToken?grant_type=${this.options.grant_type}&redirect_uri=${this.options.redirect_uri}&client_id=${this.options.client_id}&client_secret=${this.options.client_secret}&code=${code}`)
      data = await data.json();
      return this.getAuthData(data);
    } catch(err) {
      console.log('error: line 141 of scratchGoogle'+ err)
    }
  }


  async getAuthData(parsed: any){ 
    const authData: LinkedInAuthData = { 
      tokenData: {
        access_token: parsed.access_token,
        expires_in: parsed.expires_in,
      }
    };
    const options: any = {
      headers: { 'Authorization': 'Bearer '+ parsed.access_token }
    };

    try {
      let data: any = await fetch(`https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))&oauth2_access_token=${parsed.access_token}`);
      let emailData: any = await fetch(`https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))&oauth2_access_token=${parsed.access_token}`)
      data = await data.json();
      emailData = await emailData.json()

      authData.userInfo = {
        provider: 'linkedin',
        providerUserId: data.id,
        displayName: data.firstName.localized.en_US + ' ' + data.lastName.localized.en_US,
        emails: [emailData.elements[0]['handle~'].emailAddress]
      };

      return authData;
    } catch(err) {
      console.log('getAuthData error on line 153 of LinkedIn', err);
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
