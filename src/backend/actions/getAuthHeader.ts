import express from "express";

export default function getAuthHeader(request: express.Request): string | null {
	const authHeader = request.headers.authorization;
	if(!authHeader)
		return null;
	
	// Expect the header to be in the format: "Bearer <token>"
	return authHeader.substring(7);
}