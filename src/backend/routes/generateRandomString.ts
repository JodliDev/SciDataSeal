import express from "express";
import {addGetRoute} from "../actions/routes/addGetRoute.ts";
import GenerateRandomString from "../../shared/data/GenerateRandomString.ts";
import {randomBytes} from "node:crypto";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";

export default function generateRandomString(): express.Router {
	const router = express.Router();
	
	addGetRoute<GenerateRandomString>("/generateRandomString", router, async (data) => {
		const length = parseInt(data.length ?? "32");
		if(!length)
			throw new TranslatedException("errorFaultyData", "length");
		
		return {
			generatedString: randomBytes(length).toString("base64url")
		}
	});
	return router;
}


