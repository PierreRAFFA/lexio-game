import { Request, Response } from "express";
import { Db, InsertOneWriteOpResult, UpdateWriteOpResult, ObjectID } from "mongodb";
import { getDatabase } from "../../external/db";
import { filter, head, map, uniq } from 'lodash';
import { GameStatus, getAuthenticatedUser, IGamePlayed, IGamePlaying, IUser, lexio, LexioRequest } from 'lexio';

const GAME_LIMIT: number = 15;

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
  const { body: { score, language, coins, powerups }} = req;

  console.log('create');
  const game: IGamePlaying = {
    language: language.toString(),
    coins,
    powerups,
    userId: getAuthenticatedUser(req).id,
    creationDate: new Date(),
    status: GameStatus.PLAYING,
  };

  const db: Db = await getDatabase();
  const instance: InsertOneWriteOpResult = await db.collection('game').insertOne(game);

  const user: IUser = await lexio.fromReq(req).consumeCoin(game);
  console.log(user);
  res.status(201).json({
    id: instance.insertedId
  });
};

/**
 *
 * @param {e.Request} req
 * @param {e.Response} res
 */
export let update = async (req: LexioRequest, res: Response) => {
  const { body: { score, language, statistics }} = req;

  const gameId: string = req.params.id;

  console.log('update');
  const gamePlayed: IGamePlayed = {
    score: parseInt(score),
    statistics: statistics,
    userId: getAuthenticatedUser(req).id,
    status: GameStatus.PLAYED,
    played: new Date(),
  };

  console.log('gameId', gameId);

  const db: Db = await getDatabase();
  const result: UpdateWriteOpResult = await db.collection('game').updateOne({_id: new ObjectID(gameId)}, {$set: gamePlayed});
  const game: UpdateWriteOpResult = await db.collection('game').findOne({_id: new ObjectID(gameId)});

  console.log(result);

  const user: IUser = await lexio.fromReq(req).registerGameStatistics(game);
  console.log(user);
  res.status(201).json({
    id: gameId
  });
};

