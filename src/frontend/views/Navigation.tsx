import {FixedComponent} from "../mithril-polyfill.ts";
import m from "mithril";
import css from "./Navigation.module.css";
import {HistoryEntry} from "../PageComponent.ts";
import A from "./widgets/A.tsx";

interface Attributes {
	entries: HistoryEntry[]
}

export default FixedComponent<Attributes>(_ => {
	return {
		view: (vNode) => (
			<div class={`horizontal selfAlignStretch ${css.Navigation}`}>{vNode.attrs.entries.map(entry =>
				<A class={css.entry} page={entry.page} query={entry.query}>{entry.label}</A>
			)}</div>
		)
	}
});