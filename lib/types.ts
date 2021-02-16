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
  displayName: string;
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
export interface Strategy {
  router: Function;
}

/**
 * The _strategies object on Dashport that contains strategy classes
 */
export interface Strategies {
  [stratName: string]: Strategy;
}

/**
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
