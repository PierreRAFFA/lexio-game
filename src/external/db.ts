import { Db, MongoClient } from 'mongodb';

let client: MongoClient;

/**
 * Connects to the database client and returns the database
 * Or returns directly the database if already connected
 * @returns {Promise<Db>}
 */
export async function getDatabase(): Promise<Db> {
  if (!client) {
    console.log(process.env.MONGO_API_PASSWORD);
    const url: string = `mongodb://api:${process.env.MONGO_API_PASSWORD}@lexio-game-mongo:27017/?authMechanism=SCRAM-SHA-1&authSource=game`;
    client = await MongoClient.connect(url);
  }
  return client.db('game');
}

/**
 * Closes the connection with the database client
 *
 * @returns {Promise<void>}
 */
export function closeConnection(): Promise<void> {
  return client && client.close();
}
