import {Children} from "mithril";
import SessionData from "../shared/SessionData.ts";

export type PageContent = {history: HistoryEntry[], view: () => Children};
export type AsyncComponent = (query: URLSearchParams) => Promise<PageContent>;
export type PageBox = {
	isAllowed: (session: SessionData) => boolean,
	component: AsyncComponent
};
export type PageImport = {default: PageBox};

export type HistoryEntry = {label: string, page: string, query?: `?${string}`};

/**
 * Creates a private page configuration by wrapping the provided view component.
 * The access to the page is restricted based on the user's login state.
 *
 * @param view - The asynchronous component to be rendered for the page.
 * @return A PageBox object with access control applied.
 */
export function PrivatePage(view: AsyncComponent): PageBox {
	const bundle = PublicPage(view);
	bundle.isAllowed = (session: SessionData) => {
		return !!session.isLoggedIn;
	};
	return bundle;
}

/**
 * Creates a public page with unrestricted access.
 *
 * @param view - The asynchronous component to be rendered for the page.
 * @return The configured public page object containing the access check and component.
 */
export function PublicPage(view: AsyncComponent): PageBox {
	return {
		isAllowed: () => true,
		component: view
	};
}