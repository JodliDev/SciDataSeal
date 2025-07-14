import express from "express";
import SessionData from "../shared/SessionData.ts";

export interface AuthenticatedRequest extends express.Request, SessionData {}