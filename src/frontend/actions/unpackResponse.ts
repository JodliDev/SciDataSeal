import {ResponseFormat, ResponseType} from "../../shared/ResponseFormat.ts";
import ExceptionInterface from "../../shared/exceptions/ExceptionInterface.ts";
import {Lang, LangKey} from "../singleton/Lang.ts";
import TranslatedWithStatusException from "../../shared/exceptions/TranslatedWithStatusException.ts";
import TranslatedException from "../../shared/exceptions/TranslatedException.ts";

/**
 * Translates an array of values if they exist in {@link Lang}.
 *
 * @param values - An array of values to be translated.
 * @return - The translated array of values. If no translations are applied, the original array is returned.
 */
function translateValues(values: ExceptionInterface["values"]): ExceptionInterface["values"] {
	if(!values)
		return values;
	for(let i = 0; i < values.length; i++){
		const value = values[i];
		if(typeof value == "string" && Lang.has(value))
			values[i] = Lang.getDynamic(value);
	}
	return values;
}

/**
 * Processes and unpacks the JSON response from a fetch API call.
 * If the response contains an error, the method throws an appropriate exception.
 *
 * @see src/backend/actions/createErrorResponse.ts
 * @param response The Response object obtained from a fetch call.
 * @return A promise resolving to the unpacked data of type T or undefined if no data exists.
 */
export default async function unpackResponse<T extends ResponseType | undefined>(response: Response): Promise<T | undefined> {
	const data = await response.json() as ResponseFormat<T>;
	
	if(!response.ok) {
		if(data.error)
			throw new TranslatedException(data.error?.message as LangKey ?? "errorUnknown", ...(translateValues(data.error?.values) || []));
		else
			throw new TranslatedWithStatusException("errorNetwork", 500);
	}
	if(!data.ok)
		throw new TranslatedException(data.error?.message as LangKey ?? "errorUnknown", ...(translateValues(data.error?.values) || []));
	
	return data.data;
}