import { OakContext, UserProfile } from './types.ts';

/**
 * Takes in the framework the developer wants to use for their SessionManager
 * 
 * When using an instance of SessionManager, developers should only use the 4
 * currently existing attributes below
 *   logIn
 *   logOut
 *   isAuthenticated
 *   serializeUser
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
   * function that will add an attribute onto the browser's http object. This
   * will allow sessions to persist by checking if the attribute exists on the
   * browser's http object
   * 
   * TODO: Add other frameworks
   * 
   * @param {string} framework - Name of the framework the developer is using
   * @returns {Function} The function that adds the Dashport session attribute
   *   onto the browser's http object
   */
  _logInDecider(framework: string): Function {
    if (framework = 'oak') {
      return function(ctx: OakContext, userInfo: UserProfile): void {
        // magic (put persistent session info onto oak's context)
        ctx.state.dashport.session = { 
          // sessionID: ???
          // userID: ???
          // ???
        };
      }
    }

    throw new Error('Name of framework passed in is not supported');
  }

  /**
   * Takes in the name of the framework the developer is using and returns a
   * function that will ??? delete the session attribute from the browser's
   * http object ???
   * 
   * @param {string} framework - Name of the framework the developer is using
   * @returns {Function} The function that ??? deletes the session attribute
   *   from the browser's http object ???
   */
  _logOutDecider(framework: string): Function {
    if (framework = 'oak') {
      return function(ctx: OakContext, userOrSessionId????: string): void {
        // delete ctx.state.dashport.session???
      }
    }
    throw new Error('Name of framework passed in is not supported');
  }

  /**
   * Takes in the name of the framework the developer is using and returns a
   * function that will ??? check if the session exists on the browser's http
   * object ??? or if there is a specific user/session ID, check if that matches
   * ???
   * 
   * TODO: Add other frameworks
   *  
   * @param {string} framework - Name of the framework the developer is using
   * @returns {Function} Test
   */
  _isAuthenticatedDecider(framework: string): Function {
    if (framework = 'oak') {
      return function(ctx: OakContext, userOrSessionId????: string): boolean {
        // check if a user/session ID exists on context.state.dashport.session
      }
    }

    throw new Error('Name of framework passed in is not supported');
  }

  /**
   * Takes in a serializer function created by the developer that will return a
   * serialized ID
   * 
   * TODO: Edit serializeUser to take in an array containing multiple serializer
   * functions 
   * 
   * @param {Function} serializer - A serialization function
   * @param {...*} [args] - Optional arguments that will be passed into the
   *   serializer
   * @returns {*} A serialized ID (should be string but can be whatever
   *   developer wants)
   */
  serializeUser(serializer: Function, ...args: any[]): any {
    return serializer(...args);
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
