import m from "mithril";
import {HistoryEntry, PageContent} from "../../../PageComponent.ts";
import {Lang} from "../../../singleton/Lang.ts";

export default function ErrorPage(history: HistoryEntry[], pageName: string, error: unknown): PageContent {
	
	return {
		history: history,
		view: () =>  <div class="vertical hAlignCenter vAlignCenter fillSpace">
			<div class="warn">{Lang.get("errorPageHasError", pageName)}</div>
			<pre>{Lang.getError(error)}</pre>
		</div>
	};
}