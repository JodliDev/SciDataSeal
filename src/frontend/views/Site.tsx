import m, {Vnode} from "mithril";
import "./site.module.css"
import {FrontendOptions} from "../../shared/FrontendOptions.ts";
import LoadingPage from "./LoadingPage.tsx";
import {LoadedPageComponent, PageComponent} from "../PageComponent.ts";
import SessionData from "../../backend/SessionData.ts";
import Home from "./pages/Home.tsx";

export default function Site({attrs: {options, homepageName}}: Vnode<{options: FrontendOptions, homepageName: string}>) {
	let currentPage: LoadedPageComponent = LoadingPage;
	let pageName = homepageName;
	
	async function loadPage(newPageName: string): Promise<void> {
		currentPage = LoadingPage;
		m.redraw();

		if(!newPageName) {
			pageName = "Home";
			currentPage = await Home();
			m.redraw();
			return;
		}

		try {
			const imported = await import(`./pages/${newPageName}.tsx`) as { default: () => PageComponent };
			
			currentPage = await imported.default();
			pageName = newPageName;
		}
		catch {
			pageName = "Home";
			currentPage = await Home();
		}
		m.redraw();
	}
	loadPage(homepageName)
		.then();
	
	return {
		view: () => <div id={pageName}>{m(currentPage)}</div>
	};
}
