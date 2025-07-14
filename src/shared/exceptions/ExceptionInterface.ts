import {LangKey} from "../../frontend/Lang.ts";

export default interface ExceptionInterface {
	requestStatus?: number
	message?: string | LangKey
}