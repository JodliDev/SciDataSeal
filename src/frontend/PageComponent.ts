import {Children, Vnode} from "mithril";
import SessionData from "../shared/SessionData.ts";

export type PageVnode = Vnode;
export type LoadedPageComponent = (vNode: PageVnode) => {view: () => Children};
export type PageBundle = {isAllowed: (session: SessionData) => boolean, component: LoadedPageComponent};
export type PageComponent = Promise<PageBundle>;
export type PageImport = {default: (query: URLSearchParams) => PageComponent}

export function PrivatePage(view: () => Children): PageBundle {
	const bundle = PublicPage(view);
	bundle.isAllowed = (session: SessionData) => {
		return !!session.isLoggedIn;
	};
	return bundle;
}
export function PublicPage(view: () => Children): PageBundle {
	return {
		isAllowed: () => true,
		component: () => ({view: view})
	};
}