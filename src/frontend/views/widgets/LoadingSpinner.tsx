import m from "mithril"
import css from "./LoadingSpinner.module.css"
import {FixedComponent} from "../../mithril-polyfill.ts";

interface Attributes {
	class?: string
}

export default FixedComponent<Attributes>((vNode) => {
	return {
		view: () => (
			<div class={`${css.LoadingSpinner} ${vNode.attrs.class ?? ""}`}></div>
		)
	}
});