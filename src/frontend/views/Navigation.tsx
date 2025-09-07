import {TsClosureComponent} from "../mithril-polyfill.ts";
import m from "mithril";
import css from "./Navigation.module.css";
import {HistoryEntry} from "../PageComponent.ts";
import A from "./structures/A.tsx";

interface Attributes {
	entries: HistoryEntry[]
}

/**
 * Main navigation used by `src/frontend/views/Site.tsx`
 */
export default TsClosureComponent<Attributes>(() => {
	return {
		view: (vNode) => (
			<div class={`horizontal hAlignEnd selfAlignStretch ${css.Navigation}`}>
				<div class={`horizontal ${css.alignBox}`}>
					{vNode.attrs.entries.map(entry =>
						<A class={css.entry} page={entry.page} query={entry.query}>{entry.label}</A>
					)}
				</div>
			</div>
		)
	}
});