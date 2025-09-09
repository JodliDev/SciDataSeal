import express from "express";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import ManuallySyncBlockchain from "../../shared/data/ManuallySyncBlockchain.ts";
import Scheduler from "../Scheduler.ts";


/**
 * Creates a GET route for creating a save random string of a given length
 */
export default function syncBlockchainNow(scheduler: Scheduler): express.Router {
	const router = express.Router();
	
	addGetRoute<ManuallySyncBlockchain>("/syncBlockchainNow", router, async () => {
		scheduler.runNow("syncBlockchain");
		return {};
	});
	return router;
}


