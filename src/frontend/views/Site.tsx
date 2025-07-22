import m, {Vnode} from "mithril";
import css from "./Site.module.css"
import {FrontendOptions} from "../../shared/FrontendOptions.ts";
import Loading from "./pages/fallback/Loading.tsx";
import {LoadedPageComponent, PageImport} from "../PageComponent.ts";
import SessionData from "../../shared/SessionData.ts";
import {SiteTools} from "../singleton/SiteTools.ts";
import Login from "./pages/fallback/Login.tsx";
import Init from "./pages/fallback/Init.tsx";
import Home from "./pages/fallback/Home.tsx";

interface DocumentPageState {
	page: string;
	query?: `?${string}`;
}

export default function Site({attrs: {session, options, homepageName, homeQuery}}: Vnode<{session: SessionData, options: FrontendOptions, homepageName: string, homeQuery: string}>) {
	let currentPage: LoadedPageComponent = Loading;
	let pageName = homepageName;
	
	async function loadPage(newPageName: string, query: string): Promise<void> {
		currentPage = Loading;
		m.redraw();
		
		if(!options.isInit) {
			pageName = "Init";
			currentPage = Init;
			m.redraw();
			return;
		}
		if(!newPageName) {
			if(session.isLoggedIn)
				pageName = "Admin";
			else {
				pageName = "Home";
				currentPage = Home;
				m.redraw();
				return;
			}
		}

		try {
			const imported = await import(`./pages/${newPageName}.tsx`) as PageImport;
			const bundle = await imported.default(new URLSearchParams(query));
			currentPage = bundle.isAllowed(session) ? bundle.component : Login;
			pageName = newPageName;
		}
		catch(e) {
			console.error(e);
			pageName = "Home";
			currentPage = Home;
		}
		m.redraw();
	}
	
	function switchPage(page: string, newQuery?: `?${string}`): void {
		if(page != pageName) {
			const path = `${page}${newQuery ?? ""}`;
			window.history.pushState({page: page, query: newQuery} satisfies DocumentPageState, "", path);
		}
		loadPage(page, newQuery ?? "")
			.then();
	}
	
	SiteTools.init(session, switchPage);
	
	async function popstateEvent(event: PopStateEvent) {
		const state = event.state as DocumentPageState;
		await loadPage(state?.page ?? homepageName, state?.query ?? homeQuery);
	}
	
	window.addEventListener("popstate", popstateEvent);
	
	loadPage(homepageName, homeQuery)
		.then();
	
	return {
		view: () => <div class={`${css.Site} vertical`}>
			<h1 class={`${css.header} textCentered`}>Project Name</h1>
			<div class="vertical fullLine fillSpace hAlignCenter vAlignCenter">
				<div id={pageName} class={`${css.page} vertical`}>{m(currentPage)}</div>
			</div>
		</div>
	};
}
