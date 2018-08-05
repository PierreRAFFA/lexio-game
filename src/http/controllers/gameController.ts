import { Request, Response } from "express";
import { Db, InsertOneWriteOpResult } from "mongodb";
import { getDatabase } from "../../external/db";
import { assign, uniq, map, filter, head } from 'lodash';
import { IGame, IUser, lexio, LexioRequest, getAuthenticatedUser } from 'lexio';

const GAME_LIMIT: number = 15;;

/**
 *
 * @param {LexioRequest} req
 * @param {e.Response} res
 * @returns {Promise<void>}
 */
export const read = async (req: LexioRequest , res: Response) => {
  const db: Db = await getDatabase();

  //get game list
  const games: any = await db.collection('game')
    .find({})
    .sort({ creationDate: -1 })
    .limit(GAME_LIMIT).toArray();

  //extract userIds
  const userIds: Array<string> = uniq(map(games, game => {
    return game.userId;
  }));

  //get users from these ids
  const users: Array<IUser> = await lexio.fromReq(req).getUsers(userIds);

  //assign the user for each game and the serverDate
  const results: any = map(games, game => {
    game.user = head(filter(users, user => user.id === game.userId));
    game.serverDate = new Date().toISOString();
    return game;
  });

  //send response
  res.status(200).json(results);
};

/**
 *
 * @param {e.Request} req
 * @param {e.Response} res
 */
export let create = async (req: LexioRequest, res: Response) => {
  const { body: { score, language, statistics }} = req;

  const game: IGame = {
    score: parseInt(score),
    language: language.toString(),
    statistics: statistics,
    userId: getAuthenticatedUser(req).id,
  };

  const db: Db = await getDatabase();
  const instance: InsertOneWriteOpResult = await db.collection('game').insertOne(game);

  res.status(201).json({
    id: instance.insertedId
  });
};

