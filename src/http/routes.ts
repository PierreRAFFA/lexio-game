import { Request, Response, Router } from "express";

import * as gameController from './controllers/gameController';
import * as rankingController from './controllers/rankingController';
import { accessControl } from "./middlewares/accessControl";

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

// routes.get("/games/:id", gameController.getById);
routes.get("/api/games", accessControl, gameController.read);
routes.post("/api/games", accessControl, gameController.create);

routes.get("/api/rankings/:language/overall", accessControl, rankingController.readOverall);
routes.get("/api/rankings/:language/current", accessControl, rankingController.readCurrent);
// routes.put("/games/:id", gameController.put);
// routes.delete("/games/:id", gameController.del);
// routes.patch("/games/:id", gameController.patch);

export default routes;
