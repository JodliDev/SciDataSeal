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

export default function Site({attrs: {session, options}}: Vnode<{session: SessionData, options: FrontendOptions}>) {
	let currentPage: LoadedPageComponent = Loading;
	const {page: homepageName, query: homeQuery} = getUrlData();
	let pageName = homepageName;
	
	async function loadPage(newPageName: string, query: string): Promise<void> {
		currentPage = Loading;
		m.redraw();
		pageName = newPageName;
		
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
			const imported = await import(`./pages/${pageName}.tsx`) as PageImport;
			const bundle = await imported.default(new URLSearchParams(query));
			currentPage = bundle.isAllowed(session) ? bundle.component : Login;
		}
		catch(e) {
			console.error(e);
			pageName = "Home";
			currentPage = Home;
		}
		m.redraw();
	}
	
	function getUrlData() {
		const homepage = window.location.pathname.substring(options.urlPath.length);
		const search = window.location.search;
		
		return {
			page: homepage,
			query: search
		};
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
		const state: DocumentPageState = event.state ?? getUrlData();
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
