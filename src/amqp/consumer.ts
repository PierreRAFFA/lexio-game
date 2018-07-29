import { routingKeys } from "./routingKeys";
import { Message } from "amqplib/properties";
const chalk = require('chalk');

export default async function consume(msg: Message | null): Promise<any> {
  console.log(chalk.yellow('Message received'));

  //check if json is valid
  let json;
  try {
    json = JSON.parse(msg.content.toString());
  } catch (e) {
    console.error(chalk.red('Error: Trying to parse \'%s\''), msg.content.toString());
    throw e;
  }

  //for the sake of the legacy microservice, there are two ways to get the routingKey
  const routingKeyFromPayload: string = json.name;  //  old way by getting 'name'
  const routingKey: string = msg.fields.routingKey; // new way by getting the routingKey

  //define method to call
  let routingKeyFound: string;
  if (routingKeys[routingKeyFromPayload] && typeof routingKeys[routingKeyFromPayload] === 'function') {
    routingKeyFound = routingKeyFromPayload;
    console.log('Routing Key:', routingKeyFromPayload);
  } else if (routingKeys[routingKey] && typeof routingKeys[routingKey] === 'function') {
    routingKeyFound = routingKey;
  }

  if (routingKeyFound) {

    //execute the route
    try {
      return await routingKeys[routingKeyFound](json);
    } catch (e) {
      throw e;
    }
  } else {
    throw new Error(`No action found for this message. routingKeyFromPayload: ${routingKeyFromPayload} and routingKey: ${routingKey}`);
  }
}