import m from "mithril";
import {HistoryEntry, PageContent} from "../../../PageComponent.ts";
import {Lang} from "../../../singleton/Lang.ts";
import css from "./ErrorPage.module.css";

export default function ErrorPage(history: HistoryEntry[], pageName: string, error: unknown): PageContent {
	
	return {
		history: history,
		view: () => <div class="vertical hAlignStretched vAlignCenter fillSpace">
			<div class="warn textCentered">{Lang.get("errorPageHasError", pageName)}</div>
			<pre class={css.error}>{Lang.getError(error)}</pre>
		</div>
	};
}