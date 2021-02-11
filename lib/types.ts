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
  // the ID Dashport has come up with for a user
  serializedID: string;
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
 * The _strategies object on Dashport that contains strategy classes
 * 
 * TODO: Make this work ???
 */
export interface Strategies {
  [stratName: string]: any; // Is this how to do it?? What's the correct type for classes?
}

export interface googOptions {
  client_id:string; /*we do not supply this-----R*/ 
  redirect_uri:string; /*we do not supply this-----R*/
  response_type:string; /*we do not supply this-----R*/
  scope:string; /*we do not supply this------R*/
  client_secret:string;
  access_type?:string; /*we do not supply this ------Reccommend*/
  state?:string; /*we do not supply this------Reccomend*/
  included_granted_scopes?:string; /*we do not supply this**********OPTIONAL*/
  login_hint?:string;   /*we do not supply this**********OPTIONAL*/
  prompt?:string;       /*we do not supply this**********OPTIONAL*/
  grant_type?:string;
}
