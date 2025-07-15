import {LangKey} from "../frontend/Lang.ts";
import PostDataStructure from "./data/PostDataStructure.ts";

export interface ResponseFormat<T extends PostDataStructure["Response"]> {
	ok: boolean;
	data?: T;
	error?: LangKey | string;
}