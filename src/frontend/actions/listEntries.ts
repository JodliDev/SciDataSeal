import getData from "./getData.ts";
import ListEntriesInterface, {ListDefinitions} from "../../shared/data/ListEntriesInterface.ts";

/**
 * Fetches a list of data depending on the provided type and optionally appends a query string to the request.
 *
 * @param type - The type of data that is expected to be loaded.
 * @param query - An optional query string to be appended to the endpoint, starting with `?`.
 * @return A promise that resolves to the response list, or undefined if no data could be loaded.
 */
export default async function listEntries<T extends keyof ListDefinitions>(type: T, query?: `?${string}`): Promise<ListEntriesInterface<T>["Response"]["list"] | undefined> {
	return (await getData<ListEntriesInterface<T>>("/listEntries", query ? `${query}&type=${type}` : `?type=${type}`))?.list;
}