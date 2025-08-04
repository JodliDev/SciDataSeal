import m, {Vnode} from "mithril";
import css from "./Site.module.css"
import {FrontendOptions} from "../../shared/FrontendOptions.ts";
import Loading from "./pages/fallback/Loading.tsx";
import {PageContent, PageImport} from "../PageComponent.ts";
import SessionData from "../../shared/SessionData.ts";
import {SiteTools} from "../singleton/SiteTools.ts";
import Login from "./pages/fallback/Login.tsx";
import Init from "./pages/fallback/Init.tsx";
import About from "./pages/fallback/About.tsx";
import Navigation from "./Navigation.tsx";
import ErrorPage from "./pages/fallback/ErrorPage.tsx";

interface DocumentPageState {
	page: string;
	query?: `?${string}`;
}

export default function Site({attrs: {session, options}}: Vnode<{session: SessionData, options: FrontendOptions}>) {
	let currentPage: PageContent = Loading();
	const {page: homepageName, query: homeQuery} = getUrlData();
	let pageName = homepageName;
	let currentQuery = homeQuery;
	
	async function loadPage(newPageName: string, query: string): Promise<void> {
		const loading = Loading();
		loading.history = currentPage.history;
		currentPage = loading;
		m.redraw();
		pageName = newPageName;
		currentQuery = query;
		
		if(!options.isInit) {
			pageName = "Init";
			currentPage = Init();
			m.redraw();
			return;
		}
		if(!newPageName) {
			if(session.isLoggedIn)
				pageName = "Home";
			else {
				pageName = "About";
				currentPage = About();
				m.redraw();
				return;
			}
		}
		
		try {
			const imported = await import(`./pages/${pageName}.tsx`) as PageImport;
			const bundle = imported.default;
			
			currentPage = bundle.isAllowed(session) ? await bundle.component(new URLSearchParams(query)) : Login();
		}
		catch(e) {
			console.error(e);
			console.log(currentPage)
			currentPage = ErrorPage(currentPage.history, pageName, e);
			pageName = "Error";
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
		if(page != pageName || newQuery != currentQuery) {
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
		view: () => <div class={`${css.Site} vertical hAlignCenter`}>
			<div class={`${css.siteContent} vertical fullLine fillSpace hAlignCenter vAlignCenter`}>
				<h1 class={`${css.header} textCentered`}>Project Name</h1>
				<Navigation entries={currentPage.history}/>
				<div id={pageName} class={`${css.page} vertical selfAlignStretch`}>{m(currentPage)}</div>
			</div>
		</div>
	};
}
