/**
 * Should contain the same properties and methods defined by Oak
 * https://github.com/oakserver/oak
 */
export interface OakContext {
  app: any;
  cookies: any;
  request: any;
  respond: any;
  response: any;
  socket: any;
  state: any;
  assert: Function;
  send: Function;
  sendEvents: Function;
  throw: Function;
  upgrade: Function;
  params: any;
}

/**
 * Different OAuths will return different user information in different
 * structures. Dashport strategies should break down and reconstruct the user
 * info into the standardized UserProfile below
 */
export interface UserProfile {
  // the provider the user is authenticated with
  provider: string;
  // the unique id a user has with that specific provider
  providerUserId: string;
  // the display name or username for this specific user
  displayName?: string;
  name?: {
    familyName?: string;
    givenName?: string;
    middleName?: string;
  };
  emails?: Array<string>;
}

/**
 * The _serializers object on Dashport that contains serializer functions
 */
export interface Serializers {
  [serializerName: string]: Function;
}

/**
 * All Dashport strategies are classes that must contain a router method
 */
interface Strategy {
  router: Function;
}

/**
 * The _strategies object on Dashport that contains strategy classes
 */
export interface Strategies {
  [stratName: string]: Strategy;
}

/**
 * 
 * client_id: string                 identifies client to service provider - Required
 *   - client_secret: string              Required
 *   - redirect_uri: string               Required
 *   - state: string                      Required
 *   - response_type: string              O
 *   - scope: string
 * 
 * Google Strategy options that should be specified by the developer when adding
 */
export interface GoogOptions {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  scope: string;
  client_secret: string;
  access_type?: string;
  state?: string;
  included_granted_scopes?: string;
  login_hint?: string;
  prompt?: string;
  grant_type?: string;
}

/**
 * Google Strategy options that should be specified by the developer when adding
 */

/**
 * Facebook Strategy options that should be specified by the developer when adding
 */
export interface FacebookOptions {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  state?: string;
  response_type: string;
  scope: string;
}

/**
 * Template Strategy options that should be specified by the developer when adding
 */
export interface TemplateOptions {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
}

export interface TokenData {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
}

export interface AuthData {
  tokenData?: TokenData;
  userInfo?: UserProfile;
}


/**
 * Github Strategy options below
 */
export interface GitHubOptions {
  client_id: string;
  redirect_uri: string;
  login?: string;
  scope: string;
  client_secret: string;
  state?: string;
  allow_signup?: string;
}
export interface GHTokenData {
  access_token: string;
  token_type: string;
  expires_in?: string;
  scope?: string;
} 
export interface GHAuthData {
  tokenData: GHTokenData;
  userInfo?: UserProfile;
}

/**
 * Github Strategy options above 
 */
export interface FBTokenData {
  access_token: string;
  token_type: string;
  expires_in: string;
} 

export interface FBAuthData {
  tokenData: FBTokenData;
  userInfo?: UserProfile;
}

export interface AppOptions {
  client_id: string;
  client_secret: string;
  grant_type: string;
}
