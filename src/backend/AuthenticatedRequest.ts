import express from "express";
import SessionData from "../shared/SessionData.ts";

/**
 * Represents an authenticated request object that extends the default Express `Request`
 * with session data properties.
 *
 * Use this interface to access both `Request` properties/methods and session-related
 * fields in middleware, route handlers, or other areas of the application.
 */
export interface AuthenticatedRequest extends express.Request, SessionData {}