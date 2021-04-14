<p align="center">
  <img src="https://i.imgur.com/3FndGDl.png" alt="Dashport logo"/>
</p>

*<h3 align="center">Local authentication and OAuth 2.0 middleware for <a href='https://deno.land/x/dashport'>Deno</a></h3>*

<p align="center">
  </br>
  <a href="https://github.com/oslabs-beta/dashport/blob/main/LICENSE">
      <img alt="License" src="https://img.shields.io/github/license/oslabs-beta/dashport?color=light-blue">
  </a>
  <a href="https://github.com/oslabs-beta/dashport/issues">
      <img alt="Open issues" src="https://img.shields.io/github/issues-raw/oslabs-beta/dashport?color=yellow">
  </a>
  <a href="https://github.com/oslabs-beta/dashport/graphs/commit-activity">
      <img alt="Last commit" src=  "https://img.shields.io/github/last-commit/oslabs-beta/dashport?color=red">
  </a>
  <a href="https://github.com/oslabs-beta/dashport/stargazers">
      <img alt="GitHub stars" src="https://img.shields.io/github/stars/oslabs-beta/dashport?color=blue">
  </a>
</p>

# Features
- Dashport classes that handle authentication and sessions based on the server framework (currently only Oak supported).
- A [local strategy](https://github.com/oslabs-beta/dashport-localstrategy) module.
- Strategy modules that allow developers to use third-party OAuth 2.0
  - [x] [Google](https://github.com/oslabs-beta/dashport-googlestrategy)
  - [x] [Facebook](https://github.com/oslabs-beta/dashport-facebookstrategy)
  - [x] [Github](https://github.com/oslabs-beta/dashport-githubstrategy)
  - [x] [LinkedIn](https://github.com/oslabs-beta/dashport-linkedinstrategy)
  - [x] [Spotify](https://github.com/oslabs-beta/dashport-spotifystrategy)
- Written in TypeScript.

# Updates

## v1.1.0 to v1.2.0
- Require Application instance for Oak to be passed in when instantiating DashportOak, removing the need for developers to manually call app.use(dashport.initialize).

## v1.0.1 to v1.1.0
- Instead of passing in the name of the server framework being used when Dashport is instantiated, Dashport now has different classes for different server frameworks. This is to support better modularity.
- Added a Dashport class for Oak, DashportOak.
- A template Dashport has been provided for any developer to create their own Dashport for a server framework.
- Refactored authenticate to take three arguments instead of one - the strategy, the serializer, and the deserializer to be used vs the name of the strategy.
- Removed add/remove serializer/deserializer methods.
- Merged deserializer's functionality into authenticate.

# Overview
Dashport is a module that simplifies authentication in Deno. Currently, there is only Dashport support for the server framework Oak, but there is a template Dashport class available for anyone to create their own compatible Dashport.

Dashport was inspired by [Passport](http://www.passportjs.org/), the golden standard of authentication middleware for Node.js.

# Getting Started
Below is an example using the Oak server framework. To get started, import Dashport into the server file.

```typescript
// 'server.ts' file
import { DashportOak } from 'https://deno.land/x/dashport/mod.ts';
```

In the future, additional Dashports can be imported from the same mod.ts file. For example if Express was supported in Deno:

```typescript
import { DashportExpress } from 'https://deno.land/x/dashport/mod.ts';
```

After importing Dashport, import Application from Oak and instantiate it.

```typescript
// 'server.ts' file
import DashportOak from 'https://deno.land/x/dashport/mod.ts';
import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
```

Then instantiate Dashport and pass in the Application instance. This is needed in order to add a Dashport property onto Oak's context object. This specific instance of Dashport will then need to be used when calling the methods authenticate and logOut, so sessions for users can be maintained.

```typescript
// 'server.ts' file
import DashportOak from 'https://deno.land/x/dashport/mod.ts';
import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const dashport = new DashportOak(app);
```

Routes can then be added as needed

```typescript
import DashportOak from 'https://deno.land/x/dashport/mod.ts';
import { Application, Router } from 'https://deno.land/x/oak/mod.ts';

const app = new Application();
const router = new Router();

const dashport = new DashportOak(app);

// add routes here

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("error", (evt) => {
  console.log(evt.error);
});

console.log('running on port', port);
await app.listen({ port });
```

In a separate file, add Dashport configurations for a [strategy](#strategies), [serializer](#serializers), and [deserializer](#deserializers). Developers can configure as many strategies, serializers, and deserializers, as they want, as long as they follow the specific rules for each one.

```typescript
// 'dashportConfig.ts' file
import GoogleStrategy from 'https://deno.land/x/dashport_google/mod.ts';
import GitHubStrategy from 'https://deno.land/x/dashport_github/mod.ts'

export const googStrat = new GoogleStrategy({
  client_id: 'client-id-here',
  client_secret: 'client-secret-here',
  redirect_uri: 'http://localhost:8000/privatepage',
  response_type: 'code', 
  scope: 'profile email openid',
  grant_type: 'authorization_code',
});

export const ghStrat = new GitHubStrategy({
  client_id: 'client-id-here',
  client_secret: 'client-secret-here',
  redirect_uri: 'http://localhost:8000/privatepage',
})

export const serializerA = async (userInfo: any) => {
  const serializedId = Math.floor(Math.random() * 1000000000);
  userInfo.id = serializedId;

  try {
    await exampleDbCreateUpsert(userInfo);
    return serializedId;
  } catch(err) {
    return err;
    // or return new Error(err);
  }
};

export const serializerB = async (userInfo: any) => {
  ...
}

export const deserializerA = async (serializedId: (string | number)) => {
  try {
    const userInfo = await exampleDbFind({ id: serializedId });
    return userInfo;
  } catch(err) {
    return err;
    // or return new Error(err);
  }
};

export const deserializerB = async (serializedId: (string | number)) => {
  ...
}
```

Import these configurations into the server.ts file and Dashport is now ready to authenticate. Dashport's authenticate method acts as middleware, so it can be used like so:

```typescript
import { googStrat, serializerA, deserializerA } from './dashportConfig.ts';

router.get('/privatepage', 
  dashport.authenticate(googStrat, serializerA, deserializerA),
  async (ctx: any, next: any) => {
    ctx.response.body = 'This is a private page!';
  }
)
```

After authentication, Dashport will have created an ID based on the developer's defined serializer and manipulated the data however the developer specified (such as storing user info in a database). The ID then gets stored by Dashport to create a persistent session. Dashport will then invoke the developer's defined deserializer and pass in the ID. The deserializer will take this ID and manipulate it however the developer specified (such as fetching user info from the database). The returned data from the deserializer then gets stored on **ctx.locals** so the next middleware can access it. If an error occurred in the deserializer function and gets returned, the error will be stored on **ctx.locals**.

```typescript
router.get('/user-favorites', 
  dashport.authenticate(googStrat, serializerA, deserializerA),
  async (ctx: any, next: any) => {
    if (ctx.locals instanceof Error) {
      ctx.response.body = 'An Error occurred!';
    } else {
      const displayName = ctx.locals.displayName;
      ctx.response.body = `Welcome ${displayName}!`;
    }
  }
)
```

In order to end a session, a log out button can be routed to an endpoint that calls Dashport's logOut method. Here's an example use with Oak:

```typescript
router.get('/log-out',
  dashport.logOut,
  async (ctx: any, next: any) => {
    ctx.response.body = "You've logged out";
  }
)
```

# Strategies
- Strategies are the modules that can be imported with Dashport to allow third-party OAuth. They specify the authentication logic for a given OAuth service provider.
- Strategy classes need to follow two rules:
  1. Have a router method that ultimately returns an Error or the user information returned by the third-party OAuth in the form of Dashport's defined [AuthData](#authdata) interface. AuthData needs to have a **userInfo** property in the form of [UserProfile](#userprofile) and a **tokenData** property in the form of [TokenData](#tokendata).
  2. When instantiated, take in the options that are needed for the specific third-party OAuth to authenticate.

```typescript
const googStrat = new GoogleStrategy({
  client_id: 'client-id-here',
  client_secret: 'client-secret-here',
  redirect_uri: 'http://localhost:8000/privatepage', 
  response_type: 'code', 
  scope: 'profile email openid',
  grant_type: 'authorization_code',
});
```

# Serializers
- After a successful authentication, Dashport will pass the obtained user information to a serializer. It is up to the developer to define serializer functions that specify what to do with user information. User information will be passed in the form of Dashport's defined [AuthData](#authdata) interface.
- Serializer functions need to follow four rules:
  1. Accept one argument: the user data in the form of an object.
  2. Specify how to create a serialized ID.
  3. Specify what the developer wants to do with the user data (e.g. store it in a database).
  4. Return the serialized ID or an Error.

```typescript
const serializerA = async (userInfo: any) => {
  const serializedId = Math.floor(Math.random() * 1000000000);
  userInfo.id = serializedId;

  try {
    await exampleDbCreateUpsert(userInfo);
    return serializedId;
  } catch(err) {
    return err;
    // or return new Error(err);
  }
};
```

# Deserializers
- After a successful authentication, Dashport will pass the serialized ID generated from the serializer to the deserializer. The developer should specify what the deserializer should do with the ID and return any data that should be available for access in the next middleware. The shape of the return value is up to the developer. In Oak, if the deserialization is successful, the data returned is stored on **ctx.locals**. If the deserialization is not successful, an Error will be stored on **ctx.locals**.
- Deserializer functions need to follow three rules:
  1. Accept one argument: the serialized ID.
  2. Specify what the developer wants to do with the serialized ID (e.g. fetch user info from a database).
  3. Return the data (e.g. user info) or an Error.

```typescript
const deserializerA = async (serializedId: (string | number)) => {
  try {
    const userInfo = await exampleDbFind({ id: serializedId });
    return userInfo;
  } catch(err) {
    return err;
    // or return new Error(err);
  }
};
```

# Dashport Methods

## authenticate
- Exact functionality depends on which Dashport class is being used
- Authenticate is the middleware function that powers Dashport. It takes in three arguments: the instantiation of a strategy to be used, a serializer function, and a deserializer function. Authenticate first checks if a session exists. If a session does not exist, it begins the authentication process for the specified strategy.

```typescript
// Oak example
import DashportOak from 'https://deno.land/x/dashport/mod.ts';
import { Application, Router } from 'https://deno.land/x/oak/mod.ts';
import { ghStrat, serializerB, deserializerB } from './dashportConfig.ts';

const app = new Application();
const router = new Router();

const dashport = new DashportOak(app);

app.use(router.routes());
app.use(router.allowedMethods());

router.get('/secretpage', 
  dashport.authenticate(ghStrat, serializerB, deserializerB),
  async (ctx: any, next: any) => {
    ctx.response.body = 'This is a secret page!';
  }
)
```

## logOut
- Exact functionality depends on which Dashport class is being used
- logOut is a middleware function that ends a session. If a user logs out and logOut is used, the user will have to reauthenticate. Here is an example use with Oak:

```typescript
router.get('/log-out',
  dashport.logOut,
  async (ctx: any, next: any) => {
    ctx.response.body = "You've logged out";
  }
)
```

# Interfaces

## AuthData
When a strategy successfully authenticates a user, the information given by the third-party provider should be returned in the form AuthData. The object should have an optional [tokenData](##tokendata) property and a required userInfo property in the form of [UserProfile](##userprofile). This contains the information for the [authenticate](##authenticate) method to use. The interface for AuthData is as below:

```typescript
interface AuthData {
  tokenData: TokenData;
  userInfo: UserProfile;
}
```

## TokenData
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

## UserProfile
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
- Add more strategies.
- Add support for other server frameworks.

# How To Contribute
We would love to hear your experience and get your feedback on our modules. Feel free to send us any issues, concerns, or suggestions, in our Issues section, or simply contact us through LinkedIn.

# Developers

[*Dashport website*](https://www.dashport.org/)

Alex Nance :: [LinkedIn](https://www.linkedin.com/in/balexandernance/) | [GitHub](https://github.com/BAlexanderNance)

Alvin Cheng :: [LinkedIn](https://www.linkedin.com/in/alvin-cheng/) | [GitHub](https://github.com/alcheng005)

Edward Deng :: [LinkedIn](https://www.linkedin.com/in/edwarddeng-/) | [GitHub](https://github.com/ed-deng)

Sam Portelance :: [LinkedIn](https://www.linkedin.com/in/sportelance/) | [GitHub](https://github.com/sportelance)

Wei Huang :: [LinkedIn](https://www.linkedin.com/in/wei-waye-huang/) | [GitHub](https://github.com/waye-huang)
 
# License
This project is licensed under the [MIT License](https://github.com/oslabs-beta/DraQLa/blob/main/LICENSE)

