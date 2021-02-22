import { OakContext, AuthData } from '../types.ts';

/**
 * Creates an instance of `GoogleStrategy`.
 *
 * * Options:
 *
 *   - DB QUERY: string                 identifies client to service provider - Required
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
interface localOptions {
  usernamefield:string;
  passwordfield:string;
  authorize:Function;
}
export default class LocalStrategy {
  name: string = 'local';
  usernameField:string;
  passwordField:string;
  _authorize:Function;
  /**
   * @constructor
   * @param {Object} options
   * @api public
   */
  constructor (options:localOptions) {
    this.usernameField = options.usernamefield;
    this.passwordField = options.passwordfield;
    this._authorize = options.authorize;
  }

  async router(ctx: OakContext, next: any) {
    // GO_Step 1 Request Permission
    let userInfo:any = await ctx.request.body(true).value;
    userInfo = await this._authorize(userInfo);
    // GO_Step 2-3 Exchange code for Token
    await console.log('LS 61', userInfo);
    return {userInfo: userInfo};
    // return new Error("No Username or Password submitted for authorization");
  }
 
}
