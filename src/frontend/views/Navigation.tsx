import {FixedComponent} from "../mithril-polyfill.ts";
import m from "mithril";
import css from "./Navigation.module.css";
import {HistoryEntry} from "../PageComponent.ts";
import A from "./widgets/A.tsx";
import {Lang} from "../singleton/Lang.ts";

interface Attributes {
	entries: HistoryEntry[]
}

export default FixedComponent<Attributes>(_ => {
	return {
		view: (vNode) => (
			<div class={`horizontal selfAlignStretch ${css.Navigation}`}>{vNode.attrs.entries.map(entry =>
				<A class={css.entry} page={entry[0]} query={entry[1]}>{Lang.getDynamic(entry[0])}</A>
			)}</div>
		)
	}
});