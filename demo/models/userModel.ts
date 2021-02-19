import { Client } from "../deps.ts";

const pgclient = new Client('postgres://jbbzinao:OslM_aTTgi71R38LFvWXUbVw2fz5HVW5@ziggy.db.elephantsql.com:5432/jbbzinao');

// const Mongo_URI: string = Deno.env.get("MONGOURI")!;
await pgclient.connect();

// (async () => {await client.queryArray('INSERT INTO users(username, password) VALUES ("alex", "password")')})();

export default pgclient;
// export default User;
