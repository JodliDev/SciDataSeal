import {Cookies} from "../../../shared/definitions/Cookies.ts";
import express from "express";

/**
 * Logs the user out by clearing the session-related cookies.
 *
 * @param response - The Express response object used to clear cookies.
 */
export default async function doLogout(response: express.Response): Promise<void> {
	response.clearCookie(Cookies.sessionToken, { httpOnly: true });
	response.clearCookie(Cookies.userId, { httpOnly: true });
}