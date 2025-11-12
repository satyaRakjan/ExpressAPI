// db.ts
import { Collection, Document, MongoClient, ServerApiVersion } from 'mongodb';

// const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1 } });
// = require('mongodb');
const uri = `${process.env.REACT_APP_API_URL}`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
let db: any;




export async function connectPhone() {
  await client.connect();
  db =  client.db("PhoneList").collection('Phone');
//   console.log(await db.find({})
//     .limit(50)
//     .toArray());
  return await db;
}

export async function connectReview() {
  await client.connect();
  db =  client.db("PhoneList").collection('Review');
//   console.log(await db.find({})
//     .limit(50)
//     .toArray());
  return await db;
}

export function getDB(): any {
  if (!db) throw new Error("DB not connected yet");
  return db;
}
