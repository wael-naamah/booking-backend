import express from 'express';
const bcrypt = require("bcrypt");

import { ClientError } from '../../utils/exceptions';
import { User } from '../../../database-client';
import { ServiceContainer } from '../clients';

// hash password before store it
export const passwordHashHandler: express.RequestHandler = async (req, res, next) => {
    const form = req.body as User;
    
    const saltRounds = 10;
    const plaintextPassword = form.password;
    await bcrypt.genSalt(saltRounds, (_: any, salt: any) => {
      bcrypt.hash(plaintextPassword, salt, (err: any, hash: string) => {
        if (err) {
          const error = new ClientError('error hashing password', 500);
          next(error);
        } else {
          form.password = hash;
          next();
        }
      });
    });
};

export const validateToken: express.RequestHandler = async (
  req,
  res,
  next
) => {
  if (
      (!req.headers.authorization ||
          !req.headers.authorization.startsWith('Bearer ')) &&
      !(req.cookies && req.cookies.__session)
  ) {
      console.error(
          'No token was passed as a Bearer token in the Authorization header.'
      ); 
      return next();
  }

  let idToken;
  if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
  ) {
      // Read the ID Token from the Authorization header.
      idToken = req.headers.authorization.split('Bearer ')[1];
  } else if (req.cookies) {
      // Read the ID Token from cookie.
      idToken = req.cookies.__session;
  } else {
      // No cookie
      return next();
  }

  try {
    const service = (req as any).service as ServiceContainer;
    let user = await service.authService.verifyIdToken(idToken);
    (req as any).user = user.userId;
    return next();
  } catch (error) {
      console.error(`Error while verifying Firebase ID token: ${error}`);
      return next();
  }
};

export const checkAuth: express.RequestHandler = async (req, res, next) => {
  if ((req as any).account) {
      return next();
  }

  if (!(req as any).user) {
      const error = new ClientError('Unauthorized', 401);
      return next(error);
  }

  next();
};
