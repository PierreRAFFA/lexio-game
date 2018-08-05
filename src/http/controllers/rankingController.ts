import { Request, Response } from "express";
import { Db, InsertOneWriteOpResult } from "mongodb";
import { getDatabase } from "../../external/db";
import { assign, uniq, map, filter, head, take } from 'lodash';
import { IGame, IUser, lexio, LexioRequest, getAuthenticatedUser } from 'lexio';

const RANKING_NUM_ITEMS: number = 100;

/**
 * Returns the overall ranking for a specific language
 *
 * @param {LexioRequest} req
 * @param {e.Response} res
 * @returns {Promise<void>}
 */
export const readOverall = async (req: LexioRequest , res: Response) => {
  const language: string = req.params.language;
  const db: Db = await getDatabase();

  //get game list
  let ranking: any = await db.collection('ranking')
    .findOne({status: 'overall', language: language});

  ranking = assign({}, ranking, {
    ranking: take(ranking.ranking, RANKING_NUM_ITEMS)
  });

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
    .findOne({status: 'open', language: language});

  ranking = assign({}, ranking, {
    ranking: take(ranking.ranking, RANKING_NUM_ITEMS)
  });

  //send response
  res.status(200).json(ranking);
};

