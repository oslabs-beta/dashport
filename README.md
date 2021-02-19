![Dashport Logo](https://i.imgur.com/3FndGDl.png)

<h2 style="text-align: center;">Authentication middleware for Deno</h2>

# Features
- A Dashport class that handles authentication and serialization
- Strategy modules that allow developers to use third-party OAuth 2.0
  - [x] Google
  - [x] Facebook
  - [ ] Github
  - [ ] LinkedIn
- Written in TypeScript

# Overview
Dashport is a module that contains simplifies adding authentication middleware for Deno. Currently, the server framework being utilized is Oak, but Dashport has been modularized so that future frameworks can be easily added.

# Getting Started
You will need to import Dashport into your server file.
```
import { Dashport } from '[Dashport's denoland URI here]';
```

After importing Dashport and starting up a framework, Dashport will need to be initialized. For example if using "Oak", see below.
```
import { Application } from 'https://deno.land/x/oak@v6.3.1/mod.ts';
import { Dashport } from '[Dashport's denoland URI here]';

const app = new Application();
const dashport = new Dashport('oak');

app.use(dashport.initialize);
```


# Stretch Features