import {FrontendOptions} from "../../shared/FrontendOptions.ts";

/**
 * Retrieves page and query from the current URL, by considering the base URL specified in {@link options}
 *
 * @param options An object containing configuration options, including the base URL path to be removed.
 * @return An object containing the `page` and `query` properties
 */
export function getUrlData(options: FrontendOptions) {
	const homepage = window.location.pathname.substring(options.urlPath.length);
	const search = window.location.search;
	
	return {
		page: homepage,
		query: search
	};
}