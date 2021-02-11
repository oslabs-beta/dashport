import { OakContext } from './types.ts';
import Dashport from './dashport.ts';

/**
 * Takes in the framework to use for SessionManager
 * 
 * EXAMPLE:
 * 
 *   const sm = new SessionManager('oak');
 * 
 * When using an instance of SessionManager, only use
 *   sm.logIn();
 *   sm.logOut();
 *   sm.isAuthenticated();
 * 
 * @param {string} framework - The name of the server framework to be used
 */
class SessionManager {
  public logIn: Function;
  public logOut: Function;
  
  constructor(framework: string) {
    this.logIn = this._logInDecider(framework);
    this.logOut = this._logOutDecider(framework);
  }

  /**
   * Takes in the name of the framework the developer is using and returns a
   * function that will add a session object onto the browser's http  object.
   * This will allow information across different requests to persist.
   * 
   * TODO: Add an optional parameter on the returned function that takes in an
   *   expiration date for the session
   * TODO: Add other frameworks
   * 
   * @param {string} framework - Name of the framework the developer is using
   * @returns {Function} The function that adds the dashport.session object onto
   *   the browser's http object
   */
  private _logInDecider(framework: string): Function {
    if (framework = 'oak') {
      return function(ctx: OakContext, dashport: Dashport, serializedId: string): void {
        if (ctx.state._dashport) {
          ctx.state._dashport.session = serializedId;
          dashport._sId = serializedId;
        } else throw new Error('ERROR in _logInDecider: ctx.state._dashport does not exist. Please use dashport.initialize()')
      }
    }

    throw new Error('ERROR in _logInDecider: Name of framework passed in is not supported.');
  }

  /**
   * Takes in the name of the framework the developer is using and returns a
   * function that will delete the session object on the browser's http object
   * 
   * TODO: Add other frameworks
   * 
   * @param {string} framework - Name of the framework the developer is using
   * @returns {Function} The function that deletes the session object from the
   *   browser's http object
   */
  private _logOutDecider(framework: string): Function {
    if (framework = 'oak') {
      return function(ctx: OakContext): void {
        delete ctx.state._dashport.session
      }
    }

    throw new Error('ERROR in _logOutDecider: Name of framework passed in is not supported.');
  }
}

export default SessionManager;
