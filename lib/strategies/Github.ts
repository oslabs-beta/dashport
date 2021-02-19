import { OakContext, GitHubOptions, AuthData } from '../types.ts';

/** 
* Create an instance of 'GitHubStrategy'.
*
* * Options / Parameters:
*
*   - client_id: string      Required  the client ID for your Github  
*   - redirect_uri: string     Required  The URL in your application where users will be sent after authorization
*   - login: string            Required, a random string to protect against forgery attacks and coudl contina any other abibtary data
*   - scope: string            Required, suggest a specific account to use for signing in and authorizing the app
*   - state: string            Required, An unguessable random string. It is used to protect against cross-site request forgery attacks.
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
    if (!options.client_id || !options.redirect_uri || !options.response_type || !options.scope || !options.client_secret) {
      throw new Error('Mssing Required arguments');
    }

    this.options = options; 



  }
}
