import { OakContext, GitHubOptions, AuthData } from '../types.ts';

/** 
* Create an instance of 'GitHubStrategy'.
*
* * Options / Parameters:
*
*   - client_id: string      Required  the client ID for your Github  
*   - redirect_uri: string     Required  http://localhost:1234/path
*   - login: string            Required, a random string to protect against forgery attacks 
*   - scope: string            Required, suggest a specific account to use for signing in and authorizing the app
*   - state: string            Optional, An unguessable random string for protection
*   - allow_signup: string     Optional 
*                                     reference: https://docs.github.com/en/developers/apps/authorizing-oauth-apps
*
* 
*
*
*/

export default class GitHubStrategy {
  name: string = 'github'
  options: GitHubOptions; // the options makes up the uriFromParams
  uriFromParams: string; // wh: does github need a uriFromParams string? 
  /**
   * @constructor
   * @param {Object} options
   * @api public 
   */
  constructor (options: GitHubOptions) {
    if (!options.client_id || !options.redirect_uri || !options.login || !options.scope || !options.state) {
      throw new Error('Mssing Required arguments');
    }

    this.options = options; 
    // CONSTRUCTS THE REDIRECT URI FROM THE PARAMETERS PROVIDED



  }
}
