import {LangKey} from "../frontend/Lang.ts";

export interface ResponseData {
	ok: boolean;
	data?: unknown;
	error?: LangKey | string;
}