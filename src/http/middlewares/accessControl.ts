'use strict';
import { NextFunction, Response } from "express";
import * as jwt from 'jsonwebtoken';
import { VerifyErrors } from "jsonwebtoken";
import { error } from "../../utils/utils";
import { getServiceHost, LexioRequest } from "lexio";

/**
 * Populates the request by setting the user.
 * This user can be retrieved from the next middlewares or the remote methods
 *
 */
export function accessControl(req: LexioRequest, res: Response, next: NextFunction) {
  console.log('accessControl');

  const token: string = getJWTToken(req);
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err: VerifyErrors, user: any) => {
      if (err) {
        next(error(err.message, 500));;
      } else {
        req.user = user;
        next();
      }
    });
  } else {
    next(error('Not Authorized', 401));
  }
}

/**
 * Returns the token from the Authorization header
 *
 * @param {LexioRequest} req
 * @returns {string}
 */
function getJWTToken(req: LexioRequest) {
  let token: string = (req.headers.Authorization || req.headers.authorization) as string;
  if (token) {
    const split: Array<string> = token.split(' ');

    if (split.length === 2) {
      token = split[1];
    }
  }

  return token;
}
