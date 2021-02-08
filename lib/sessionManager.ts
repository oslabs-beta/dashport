import { OakContext, UserProfile } from './types.ts';

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
  logIn: Function;
  logOut: Function;
  isAuthenticated: Function;
  
  constructor(framework: string): void {
    this.logIn = _logInDecider(framework);
    this.logOut = _logOutDecider(framework);
    this.isAuthenticated = _isAuthenticatedDecider(framework);
  }

  /**
   * Takes in the name of the framework the developer is using and returns a
   * function that will add a dashport.session object onto the browser's http 
   * object. This will allow information across different requests to persist
   * 
   * TODO: Add other frameworks
   * 
   * @param {string} framework - Name of the framework the developer is using
   * @returns {Function} The function that adds the dashport.session object onto
   *   the browser's http object
   */
  _logInDecider(framework: string): Function {
    if (framework = 'oak') {
      return function(ctx: OakContext, serializedId: string): void {
        ctx.state.dashport.session = { userId: serializedId };
      }
    }

    throw new Error('Name of framework passed in is not supported');
  }

  /**
   * Takes in the name of the framework the developer is using and returns a
   * function that will delete the session object on the browser's http object
   * 
   * @param {string} framework - Name of the framework the developer is using
   * @returns {Function} The function that deletes the session object from the
   *   browser's http object
   */
  _logOutDecider(framework: string): Function {
    if (framework = 'oak') {
      return function(ctx: OakContext): void {
        delete ctx.state.dashport.session
      }
    }

    throw new Error('Name of framework passed in is not supported');
  }

  /**
   * Takes in the name of the framework the developer is using and returns a
   * function that will check if the userId passed in matches the session
   * object's userId
   * 
   * TODO: Add other frameworks
   *  
   * @param {string} framework - Name of the framework the developer is using
   * @returns {Function} The function that checks if the userId passed in
   *   matches the session object's userId
   */
  _isAuthenticatedDecider(framework: string): Function {
    if (framework = 'oak') {
      return function(ctx: OakContext, serializedId: string): boolean {
        if (ctx.state.dashport.session) {
          if (serializedId === ctx.state.dashport.session.userId) return true;
          return false;
        }

        return false;
      }
    }

    throw new Error('Name of framework passed in is not supported');
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////
// /**
//  * Should contain the same properties and methods defined by Oak
//  * https://github.com/oakserver/oak
//  */
// interface OakContext {
//   app: any;
//   cookies: any;
//   request: any;
//   respond: any;
//   response: any;
//   socket: any;
//   state: any;
//   assert: Function;
//   send: Function;
//   sendEvents: Function;
//   throw: Function;
//   upgrade: Function;
// }



// /**
//  * Contains a session ID and a user ID that will be checked at different times.
//  * 
//  * The sessionId will be checked when a developer wants to place verifySession
//  * as middleware to check if there is a valid session.
//  * 
//  * @param {string} sessionId - A serialized session ID to identify this instance
//  * @param {Date | number} expires -  A Date or number (in milliseconds) that
//  *   determines when the session expires
//  */
// class Session {
//   expires: Date | number;
  
//   constructor(sessionId: string, expires: Date | number) { 
//     this.sessionId = sessionId;

//     // if expires is a number, set this.expires to current date plus number of
//     // milliseconds to that date
//     // else, set this.expires to the Date
//   }
// }



// class SessionManager {
//   constructor() {
      
//   }

//   /**
//    * Create a new session with an encrypted session ID
//    * ????? Where will this new session be stored ?????
//    * 
//    * @param {Date | number} expires - A Date or number (in milliseconds) that 
//    * determines when the session expires
//    * @returns {Session} A new Session
//    */
//   createSession(expires: Date | number): Session {
//     //  create a random encrypted session ID
//     //  create and return a new Session and pass in
//     //    the encrypted session ID
//     //    the expiration time
//   }

//   /**
//    * Deletes a session. Should be used when a user logs out or a session has expired
//    * 
//    * @param {string} sessionId - The encrypted sessionId (issue if encrypted) or
//    *   the actual sessionId
//    */
//   deleteSession() {

//   }

//   /**
//    * Acts as a middleware. Decides whether to send client to next middleware or
//    * to redirect to login by checking if a session exists
//    * ????? How do we access an existing session if it exists ?????
//    * 
//    * Currently configured for oak
//    * TODO: Configure for different frameworks
//    *  
//    * @param {string} framework - A string representing which server framework
//    *   the developer wants to use
//    * @returns {Function} A middleware function in the form of the server
//    *   framework specified
//    */
//   verifySession(framework: string) {
//     // depending on the framework, return a function that follows the framework
//     // function declaration for its middleware
//     if (framework = 'oak') {
//       return async function(ctx: OakContext, next: Function) {
//         // get the cookie 'session' from ctx and compare the encrypted cookie
//         // to the sessionId that exists somewhere?
//       }
//     }

//     throw new Error('Name of framework passed in is not supported');
//   }

//   /**
//    * Create a random n-digit serial number based on a default serializer we define 
//    * 
//    * TODO: Have an optional parameter to generate serialized IDs based on
//    * a serializer the developer passes in.
//    *  TODO: make multiple serializers possible
//    * 
//    * @param {Array} [existingIds] - An optional array that contains existing IDs
//    *   so the serializer will generate a new ID if it already exists
//    * @returns {string} A random but unique serialized ID
//    */
//   serializeUser(existingIds?: Array<any>): string {
//     // create a random n-digit ID

//     // if existingIds array exists, check if the array includes the generated ID
//     // if it does, generate a new one

//     // return the new ID
//   }
// }
////////////////////////////////////////////////////////////////////////////////////////////////////

export default SessionManager;
