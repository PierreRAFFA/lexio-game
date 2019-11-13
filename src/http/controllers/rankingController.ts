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
import * as moment from 'moment';

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

  const currentWeekStart = moment().day(1).format('YYYYMMDD');
  const currentWeekEnd = moment().day(7).format('YYYYMMDD');
  const currentReference = `${currentWeekStart}-${currentWeekEnd}`;

  const authenticatedUser: IFullUser = getAuthenticatedUser(req);
  const ranking = await getRankingFromReference(language, currentReference, authenticatedUser);
  if (ranking) {
    res.status(200).json(ranking);
  } else {
    const error: Error = new Error();
    error.message = 'Ranking not found';
    res.status(404).send({error});
  }
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

  const authenticatedUser: IFullUser = getAuthenticatedUser(req);
  const ranking = await getRankingFromReference(language, reference, authenticatedUser);
  if (ranking) {
    res.status(200).json(ranking);
  } else {
    const error: Error = new Error();
    error.message = 'Ranking not found';
    res.status(404).send({error});
  }
};

async function getRankingFromReference(language: string, reference: string, authenticatedUser: IFullUser): Promise<any> {
  const db: Db = await getDatabase();
  let ranking: any = await db.collection('ranking')
    .findOne({language, reference});

  if (ranking) {
    ranking = assign({}, ranking, {
      ranking: take(ranking.ranking, RANKING_NUM_ITEMS)
    });

    ranking.userPosition = getUserPositionFromRanking(ranking, authenticatedUser);
    return ranking;
  } else {
    //send response
    // const oldestRanking: IRanking = await db.collection('ranking')
    //   .findOne({language, reference: {$exists: true}}, {sort: {reference: 1}});
    //
    // const oldestRankingReference: string = oldestRanking.reference;

    const matches = reference.match(/^([0-9]{4})([0-9]{2})([0-9]{2})-([0-9]{4})([0-9]{2})([0-9]{2})$/);

    if (matches) {
      const [, year1, month1, day1, year2, month2, day2] = matches;
      const start = moment(`${year1}-${month1}-${day1}`);
      const end = moment(`${year2}-${month2}-${day2}`);
      const dayOfWeekStart: number = start.day();
      const dayOfWeekEnd: number = end.day();
      if (dayOfWeekStart == 1 && dayOfWeekEnd == 0) {
        const isoWeek: number = start.isoWeek();

        return {
          _id: "none",
          language: language,
          reference: reference,
          ranking: [],
          status: "done",
          startDate: new Date(start.format()).toISOString(),
          endDate: new Date(end.format()).toISOString(),
          week: isoWeek,
          userPosition: 0
        };
      }
    }
  }
}

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
