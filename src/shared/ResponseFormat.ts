import ExceptionInterface from "./exceptions/ExceptionInterface.ts";

export type ResponseType = Record<string, unknown>;

/**
 * Expected JSON structure of a backend response.
 * @see GetDataStructureInterface
 * @see PostDataStructureInterface
 * @see src/frontend/singleton/Lang.ts
 *
 * @property ok Indicates whether the response was successful.
 * @property data Optional data returned when the response is successful.
 * @property error Optional error object containing an error message and associated values when the response fails.
 * `message` is expected to be translatable by `Lang.get()`.
 * `values` will be used as parameters for `Lang.get()`. They can, but do not have to be translatable.
 */
export interface ResponseFormat<T extends ResponseType | undefined> {
	ok: boolean;
	data?: T;
	error?: {message: ExceptionInterface["message"], values: ExceptionInterface["values"]};
}