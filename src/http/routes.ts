import { NextFunction, Request, Response, Router } from "express";

import * as exampleController from './controllers/example';

const routes: Router = require('express').Router();

routes.get('/', (req: Request, res: Response) => {
    res.status(200).send('Server running successfully');
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////// HEALTHCHECK
routes.get('/healthcheck', (req: Request, res: Response) => {
  res.status(200).send('');
});

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////// EXAMPLE

routes.get("/examples/:id", exampleController.get);
routes.post("/example", exampleController.post);
routes.put("/examples/:id", exampleController.put);
routes.delete("/examples/:id", exampleController.del);
routes.patch("/examples/:id", exampleController.patch);

export default routes;