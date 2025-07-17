import m, {Vnode} from "mithril";
import css from "./Site.module.css"
import {FrontendOptions} from "../../shared/FrontendOptions.ts";
import LoadingPage from "./LoadingPage.tsx";
import {LoadedPageComponent, PageComponent} from "../PageComponent.ts";
import SessionData from "../../shared/SessionData.ts";
import Home from "./pages/Home.tsx";
import {SiteTools} from "../singleton/SiteTools.ts";
import Login from "./pages/Login.tsx";
import Init from "./pages/Init.tsx";

interface DocumentPageState {
	page: string;
	search?: `?${string}`;
}

export default function Site({attrs: {session, options, homepageName}}: Vnode<{session: SessionData, options: FrontendOptions, homepageName: string}>) {
	let currentPage: LoadedPageComponent = LoadingPage;
	let pageName = homepageName;
	
	async function loadPage(newPageName: string): Promise<void> {
		currentPage = LoadingPage;
		m.redraw();
		
		if(!options.isInit) {
			pageName = "Init";
			currentPage = (await Init()).component;
			m.redraw();
			return;
		}
		if(!newPageName) {
			pageName = "Home";
			currentPage = (await Home()).component;
			m.redraw();
			return;
		}

		try {
			const imported = await import(`./pages/${newPageName}.tsx`) as { default: () => PageComponent };
			
			const bundle = await imported.default();
			currentPage = bundle.isAllowed(session) ? bundle.component : (await Login()).component;
			pageName = newPageName;
		}
		catch {
			console.warn(`Page ${newPageName} not found`);
			pageName = "Home";
			currentPage = (await Home()).component;
		}
		m.redraw();
	}
	
	function switchPage(page: string, search?: `?${string}`): void {
		const path = `${page}${search ?? ""}`;
		window.history.pushState({page: page, search: search} satisfies DocumentPageState, "", path);
		loadPage(page)
			.then();
	}
	
	SiteTools.init(session, switchPage);
	
	async function popstateEvent(event: PopStateEvent) {
		const state = event.state as DocumentPageState;
		await loadPage(state?.page ?? homepageName);
	}
	
	window.addEventListener("popstate", popstateEvent);
	
	loadPage(homepageName)
		.then();
	
	return {
		view: () => <div class={`${css.Site} vertical`}>
			<h1 class={`${css.header} textCentered`}>Project Name</h1>
			<div class="vertical fullLine fillSpace hAlignCenter vAlignCenter">
				<div id={pageName} class={`${css.page} vertical`}>{m(currentPage, {session: session, options: options})}</div>
			</div>
		</div>
	};
}
