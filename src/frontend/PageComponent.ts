import {Children, Vnode} from "mithril";
import SessionData from "../shared/SessionData.ts";

export type PageVnode = Vnode;
export type PageContent = {history: HistoryEntry[], view: () => Children};
export type AsyncComponent = (query: URLSearchParams) => Promise<PageContent>;
export type PageBox = {
	isAllowed: (session: SessionData) => boolean,
	component: AsyncComponent
};
export type PageImport = {default: PageBox};

export type HistoryEntry = [string, `?${string}`] | [string];

export function PrivatePage(view: AsyncComponent): PageBox {
	const bundle = PublicPage(view);
	bundle.isAllowed = (session: SessionData) => {
		return !!session.isLoggedIn;
	};
	return bundle;
}
export function PublicPage(view: AsyncComponent): PageBox {
	return {
		isAllowed: () => true,
		component: view
	};
}