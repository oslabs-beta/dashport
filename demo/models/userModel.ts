import { Client } from "../deps.ts";
import { PGURI } from "../demoSecrets.ts"

const pgclient = new Client(PGURI);

// const Mongo_URI: string = Deno.env.get("MONGOURI")!;
await pgclient.connect();

// (async () => {await client.queryArray('INSERT INTO users(username, password) VALUES ("alex", "password")')})();

export default pgclient;
// export default User;
