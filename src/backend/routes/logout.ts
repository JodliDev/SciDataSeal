import express from "express";
import LogoutInterface from "../../shared/data/LogoutInterface.ts";
import doLogout from "../actions/authentication/doLogout.ts";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";

/**
 * Creates a POST route for logout
 */
export default function logout(): express.Router {
	const router = express.Router();
	
	addGetRoute<LogoutInterface>("/logout", router, async (_data, _request, response) => {
		await doLogout(response);
		
		return {};
	});
	return router;
}
