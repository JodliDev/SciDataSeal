import {LangKey} from "../../frontend/singleton/Lang.ts";

export default interface ExceptionInterface {
	requestStatus?: number
	message?: string | LangKey
}