import ExceptionInterface from "./ExceptionInterface.ts";
import {LangKey} from "../../frontend/singleton/Lang.ts";

export default class QuestionnaireHasNoColumnsException extends Error implements ExceptionInterface {
	requestStatus: number = 400;
	constructor(message?: LangKey) {
		super(message ?? "errorQuestionnaireHasNoColumns");
	}
}