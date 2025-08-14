import getData from "./getData.ts";
import GetEntryInterface, {GetDefinitions} from "../../shared/data/GetEntryInterface.ts";

/**
 * Fetches a data entry depending on the provided type and optionally appends a query string to the request.
 *
 * @param type - The type of data that is expected to be loaded.
 * @param id - The id of the data entry to be loaded.
 * @param query - An optional query string to be appended to the endpoint, starting with `?`.
 * @return A promise that resolves to the data entry, or undefined if no data could be loaded.
 */
export default async function getEntry<T extends keyof GetDefinitions>(type: T, id: number, query?: `?${string}`): Promise<GetEntryInterface<T>["Response"] | undefined> {
	const queryPart = `type=${type}&id=${id}`;
	return await getData<GetEntryInterface<T>>("/getEntry", query ? `${query}&${queryPart}` : `?${queryPart}`);
}