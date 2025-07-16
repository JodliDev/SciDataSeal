import {Children, Vnode} from "mithril";
import SessionData from "../shared/SessionData.ts";
import {FrontendOptions} from "../shared/FrontendOptions.ts";

export type PageOptions = Vnode<{session: SessionData, options: FrontendOptions}>;
export type LoadedPageComponent = (pageData: PageOptions) => {view: () => Children};
export type PageBundle = {isAllowed: (session: SessionData) => boolean, component: LoadedPageComponent};
export type PageComponent = Promise<PageBundle>;

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
		component: () => {
			return {view: view}
		}
	};
}