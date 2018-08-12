import { Request, Response } from "express";
import { Db, InsertOneWriteOpResult } from "mongodb";
import { getDatabase } from "../../external/db";
import { assign, uniq, map, filter, head, take, findIndex } from 'lodash';
import {
  IGame,
  IUser,
  lexio,
  LexioRequest,
  getAuthenticatedUser,
  createError,
  IRanking,
  IFullUser,
  IRankingItem
} from 'lexio';
import { RankingStatus } from "../../interfaces";

const RANKING_NUM_ITEMS: number = 100;

/**
 * Returns the overall ranking for a specific language
 *
 * @param {LexioRequest} req
 * @param {e.Response} res
 * @returns {Promise<void>}
 */
export const readOverall = async (req: LexioRequest, res: Response) => {
  const language: string = req.params.language;
  const db: Db = await getDatabase();

  //get game list
  let ranking: any = await db.collection('ranking')
    .findOne({status: RankingStatus.Overall , language});

  ranking = assign({}, ranking, {
    ranking: take(ranking.ranking, RANKING_NUM_ITEMS)
  });

  const authenticatedUser: IFullUser = getAuthenticatedUser(req);
  ranking.userPosition = getUserPositionFromRanking(ranking, authenticatedUser);

  //send response
  res.status(200).json(ranking);
};

/**
 * Returns the current ranking for a specific language
 *
 * @param {e.Request} req
 * @param {e.Response} res
 */
export let readCurrent = async (req: LexioRequest, res: Response) => {
  const language: string = req.params.language;
  const db: Db = await getDatabase();

  //get game list
  let ranking: any = await db.collection('ranking')
    .findOne({status: RankingStatus.Open, language, reference: {$exists: true}});

  ranking = assign({}, ranking, {
    ranking: take(ranking.ranking, RANKING_NUM_ITEMS)
  });

  const authenticatedUser: IFullUser = getAuthenticatedUser(req);
  ranking.userPosition = getUserPositionFromRanking(ranking, authenticatedUser);

  //send response
  res.status(200).json(ranking);
};

/**
 * Returns the current ranking for a specific language
 *
 * @param {e.Request} req
 * @param {e.Response} res
 */
export let readFromReference = async (req: LexioRequest, res: Response) => {
  const language: string = req.params.language;
  const reference: string = req.params.reference;
  const db: Db = await getDatabase();

  //get game list
  let ranking: IRanking = await db.collection('ranking')
    .findOne({language, reference});


  if (ranking) {
    ranking = assign({}, ranking, {
      ranking: take(ranking.ranking, RANKING_NUM_ITEMS)
    });

    const authenticatedUser: IFullUser = getAuthenticatedUser(req);
    ranking.userPosition = getUserPositionFromRanking(ranking, authenticatedUser);

    //send response
    res.status(200).json(ranking);
  } else {
    //send response

    const error: Error = new Error();
    error.message = 'Ranking not found';
    res.status(404).send(error);
  }
};

/**
 * Returns the user position within the ranking
 *
 * @param {IRanking} ranking
 * @param {IFullUser} user
 * @returns {number}
 */
function getUserPositionFromRanking(ranking: IRanking, user: IFullUser): number {
  return findIndex<IRankingItem>(ranking.ranking, (rankItem: IRankingItem) => rankItem.user._id === user.id);
}
