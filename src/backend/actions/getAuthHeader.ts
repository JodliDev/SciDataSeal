import express from "express";

/**
 * Extracts the authentication token from the Authorization header in the HTTP request.
 *
 * @param request - The HTTP request object containing headers.
 * @return Returns the authentication token as a string if found; otherwise, returns null.
 */
export default function getAuthHeader(request: express.Request): string | null {
	const authHeader = request.headers.authorization;
	if(!authHeader)
		return null;
	
	// Expect the header to be in the format: "Bearer <token>"
	return authHeader.substring(7);
}