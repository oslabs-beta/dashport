import { GitHubOptions } from '../types.ts';

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
    if (!options.client_id || !options.redirect_uri || !options.client_secret || !options.state) {
      throw new Error('Mssing Required arguments');
    }

    this.options = options; 
    // ACTION NEEDED:
      // url for first endpoint: 
    this.authURL = 'http://localhost:3000'
    
    this.tokenURL = ''
      // 
    this.authDataURL = ''

    // PRE STEP 1: 
      // Constructs the second half of the authURL for your first endpoint from the info you put into 'options'
    // ACTION NEEDED: 
      // If there are any variables in options that aren't needed for your first endpoint (but will be needed later), 
      // add them as an array of strings (even if there's only 1 item)
    this.uriFromParams = this.constructURI(this.options);
  }

  constructURI(options:any, skip?:string[]): any{
    let paramArray: string[][] = Object.entries(options);
    let paramString: string = '';

    for (let i = 0; i < paramArray.length; i++) {
      let [key, value] = paramArray[i];
      
      if (skip.includes(key)) continue;
      // adds the key and '=' for every member of options not in the skip array
      paramString += (key + '=');
      // adds the value and '&' for every member of options not in the skip array
      paramString += (value + '&');
    }
    // removes the '&' we just placed at the end of the string
    if(paramString[paramString.length - 1] === '&'){
      paramString = paramString.slice(0, -1);
    }
    console.log(paramString);
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









    
}

