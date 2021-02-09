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
}

/**
 * Different OAuths will return different user information in different
 * structures. Dashport strategies should break down and reconstruct the user
 * info into the standardized UserProfile below
 */
export interface UserProfile {
  // the ID Dashport has come up with for a user
  serializedID: string;
  // the provider the user is authenticated with
  provider: string;
  // the unique id a user has with that specific provider
  providerUserId: string;
  // the display name or username for this specific user
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
    middleName: string;
  };
  emails: Array<string>;
}

export interface Serializers {
  [serializerName: string]: Function;
}
