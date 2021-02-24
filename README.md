<p align="center">
  <img src="https://i.imgur.com/3FndGDl.png" alt="Dashport logo"/>
</p>

*<h3 align="center">Authentication middleware for Deno</h3>*

# Features
- A Dashport class that handles authentication and serialization.
- A local strategy module.
- Strategy modules that allow developers to use third-party OAuth 2.0
  - [x] Google
  - [x] Facebook
  - [ ] Github
  - [ ] LinkedIn
- Written in TypeScript.

# Overview
Dashport is a module that simplifies adding authentication middleware for Deno. Currently, the server framework being utilized is Oak, but Dashport has been modularized so that future frameworks can be easily added.

Dashport was inspired by [Passport](http://www.passportjs.org/), the golden authentication middleware module for Node.js.

# Getting Started
To get started, import Dashport. For easier modularity, Dashport can be imported into its own file for configurations.
```typescript
import { Dashport } from '[Dashport's denoland URI here]';
```

When Dashport is instantiated, pass in the server framework being used (Dashport currently only supports Oak). Then begin adding configurations for a serializer, deserializer, and strategy. Any errors returned from serializers and deserializers should be instances of 'Error'.
```typescript
// 'dashportconfig.ts' file

import { Dashport } from '[Dashport's denoland URI here]';
import { GoogleStrategy } from '[GoogleStrategy's denoland URI here]';

const dashport = new Dashport('oak');

dashport.addSerializer('serializer-1', (userInfo) => {
  const serializedId = Math.floor(Math.random() * 1000000000);
  userInfo.id = serializedId;

  try {
    const exampleUser = await exampleDbCreateUpsert(userInfo);
    return serializedId;
  } catch(err) {
    return err;
    // or return new Error(err);
  }
});

dashport.addDeserializer('deserializer-1', (serializedId) => {
  try {
    const exampleUserInfo = await exampleDbFind({ id: serializedId });
    return userInfo;
  } catch(err) {
    return err;
    // or return new Error(err);
  }
});

dashport.addStrategy('goog', new GoogleStrategy({
  client_id: 'client-id-here',
  redirect_uri: 'redirect-uri-here', 
  response_type: 'response-type-here', 
  scope: 'scopes-wanted-here',
  client_secret: 'client-secret-here',
  grant_type: 'grant-type-here',
}));

export default dashport;
```

An initialization step for Dashport then needs to be added into the server file.
```typescript
import { Application, Router } from 'https://deno.land/x/oak@v6.3.1/mod.ts';
import dashport from './dashportconfig.ts';

const app = new Application();
const router = new Router();

app.use(dashport.initialize);

app.use(router.routes());
app.use(router.allowedMethods());
```

After the initialization is added, Dashport is now set up to authenticate. Dashport's authenticate method acts as middleware, so if the framework is Oak, it can be used like below:
```typescript
router.get('/privatepage', 
  dashport.authenticate('goog'),
  async (ctx: any, next: any) => {
    ctx.body = 'This is a private page!';
  }
)
```
After authentication, Dashport will have serialized an ID and manipulated user information based on the developer's defined serializer, and have created a session. In order to get the user information in another route, Dashport's deserialize property can be used as middleware. If the framework is Oak, deserialize will store either the user information or an Error on **ctx.locals** for the next middleware to access.
```typescript
router.get('/user-favorites', 
  dashport.deserialize,
  async (ctx: any, next: any) => {
    const displayName = ctx.locals.displayName;
    ctx.body = `Welcome ${displayName}!`;
  }
)
```

In order to end a session, a log out button can be routed to an endpoint that uses Dashport's logOut property as middleware. If the framework is Oak, it can be used like below:
```typescript
router.get('/log-out',
  dashport.logOut,
  async (ctx: any, next: any) => {
    ctx.body = `You've logged out";
  }
)
```

# Methods
## initialize
- Functionality depends on the server framework that was passed in when instantiating Dashport.
- initialize is an async middleware function that creates a persistent Dashport object across multiple HTTP requests. For Oak, Dashport takes advantage of the persistent ctx.state and adds a Dashport key to it. This bypasses the need to do any monkey patching.
```typescript
// Oak example

import { Application, Router } from 'https://deno.land/x/oak@v6.3.1/mod.ts';
import { Dashport } from '[Dashport's denoland URI here]';

const app = new Application();

app.use(dashport.initialize);
```

## authenticate
- Functionality depends on the server framework that was passed in when instantiating Dashport.
- authenticate is the async middleware function that powers Dashport. It takes in one argument that is the name of the strategy to be used. Authenticate checks if a session exists. If a session does not exist, it begins the authentication process for the strategy specified. If the authentication is successful, the first serializer added by the developer will be 
```typescript
// Oak example

import { Application, Router } from 'https://deno.land/x/oak@v6.3.1/mod.ts';
import { Dashport } from '[Dashport's denoland URI here]';

const app = new Application();
const router = new Router();
const dashport = new Dashport('oak');

// use addSerializer, addDeserializer, and addStrategy, to add a serializer, deserializer, and strategy, to the Dashport instance

app.use(dashport.initialize);

app.use(router.routes());
app.use(router.allowedMethods());

router.get('/privatepage', 
  dashport.authenticate('name-of-strategy-added'),
  async (ctx: any, next: any) => {
    ctx.body = 'This is a private page!';
  }
)
```

## addSerializer
- Dashport handles only authentication. If authentication is successful, it will pass the obtained user information to a serializer. It is up to the developer to define serializer functions that specify what to do with user information. User information will be passed in the form of Dashport's defined [AuthData](#authdata) interface.
- addSerializer is a function that takes two arguments. The first argument is the name a developer wants to call their serializer and the second argument is the serializer function. Serializer functions need to
  1. Take in one argument which will be the user data in the form of an object.
  2. Specify what the developer wants to do with the user data (store it in a database, add some info to response object, etc).
  3. Specify how to create a serialized ID.
  4. Return the serialized ID or an Error.
```typescript
dashport.addSerializer('serializer-1', (userInfo) => {
  const serializedId = Math.floor(Math.random() * 1000000000);
  userInfo.id = serializedId;

  try {
    const exampleUser = await exampleDbCreateUpsert(userInfo);
    return serializedId;
  } catch(err) {
    return err;
    // or return new Error(err);
  }
});
```

## removeSerializer
- removeSerializer is a function that takes one argument. It will remove a serializer by name that was added.
```typescript
dashport.removeSerializer('serializer-1');
```

## addDeserializer
- Deserializers are developer-defined functions that take in a serialized ID and return the user information that the developer wants to access in the next middleware. The shape will be how the developer decided to store it in their serializer function.
- addDeserializer is a function that takes two arguments. The first argument is the name a developer wants to call their deserializer and the second argument is the deserializer function. Deserializer functions need to
  1. Take in one argument which will be the serialized ID.
  2. Specify what the developer wants to do with the serialized ID to obtain user info (e.g. fetch the user info from a database).
  3. Return the user info or an Error.
```typescript
dashport.addDeserializer('deserializer-1', (serializedId) => {
  try {
    const userInfo = await exampleDbFind({ id: serializedId });
    return userInfo;
  catch(err) {
    return err;
    // or return new Error(err);
  }
})
```

## deserialize
- Functionality depends on the server framework that was passed in when instantiating Dashport.
- deserialize is an async middleware function that checks if a session exists. If a session exists, it checks if the session IDs match. If they do, it will execute the first deserializer added by the developer and store the user information for the next middleware to use. In Oak, if the deserialization is successful, the user information is stored on **ctx.locals**. If the deserialization is not successful, an Error will be stored on **ctx.locals**.
```typescript
router.get('/user-favorites', 
  dashport.deserialize,
  async (ctx: any, next: any) => {
    const displayName = ctx.locals.displayName;
    ctx.body = `Welcome ${displayName}!`;
  }
)
```

## removeDeserializer
- removeDeserializer is a function that takes one argument. It will remove a deserializer by name that was added.
```typescript
dashport.removeDeserializer('deserializer-1');
```

## addStrategy
- Strategies are the variety of modules that can be imported with Dashport to allow third-party OAuth. They specify the logic for how to get authenticated and authorized to access user information from a third-party OAuth. By following only the few rules listed below, anyone can make a strategy.
- addStrategy is a function that takes two arguments. The first argument is the name the developer wants to call the strategy. The second argument is a new instance of the strategy with the options passed in. Strategy classes need to
  1. Have a router method that ultimately returns an Error or the user information returned by the third-party OAuth in the form of Dashport's defined [AuthData](#authdata) interface. AuthData needs to have a **userInfo** property in the form of [UserProfile](#userprofile) and an optional **tokenData** property in the form of [TokenData](#tokendata).
  2. Take in any options that are needed for the specific third-party OAuth to authenticate.
```typescript
dashport.addStrategy('goog', new GoogleStrategy({
  client_id: 'client-id-here',
  redirect_uri: 'redirect-uri-here', 
  response_type: 'response-type-here', 
  scope: 'scopes-wanted-here',
  client_secret: 'client-secret-here',
  grant_type: 'grant-type-here',
}));
```

## removeStrategy
- removeStrategy is a function that takes one parameter. It will remove a strategy by name that was added.
```typescript
dashport.removeStrategy('goog');
```

## logOut
- Functionality depends on the server framework that was passed in when instantiating Dashport.
- logOut is an async middleware function that ends a session. If a user logs out and logOut is used, the user will have to reauthenticate. If the framework is Oak, it can be used like below:
```typescript
router.get('/log-out',
  dashport.logOut,
  async (ctx: any, next: any) => {
    ctx.body = `You've logged out";
  }
)
```

# AuthData
When a strategy successfully authenticates a user, the information given by the third-party provider should be returned in the form AuthData. The object should have an optional [tokenData](#tokendata) property and a required userInfo property in the form of [UserProfile](#userprofile). This contains the information for the [authenticate](#authenticate) method to use. The interface for AuthData is as below:
```typescript
interface AuthData {
  tokenData?: TokenData;
  userInfo?: UserProfile;
}
```

# TokenData
Any relevant token data the developer wishes to receive from the third-party OAuth should be stored in an object with the below interface:
```typescript
interface TokenData {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
}
```

# UserProfile
Since every OAuth provider returns information in different names and shapes, it is up to each strategy to conform the data returned into Dashport's defined UserProfile interface. This should contain all data the developer wishes to use.
```typescript
export interface UserProfile {
  provider: string;
  providerUserId: string;
  displayName?: string;
  name?: {
    familyName?: string;
    givenName?: string;
    middleName?: string;
  };
  emails?: Array<string>;
}
```

# Stretch Features
- Merge deserialize's functionality into authenticate.
- Currently only the first serializers and deserializers added are able to be used by Dashport. Add the option to use specific serializers and deserializers by name.
- Extend serializerization and deserializerization process to be able to use multiple serializers and deserializers.
- Add more strategies.
- Add support for other server frameworks.
