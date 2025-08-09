import m from "mithril"
import css from "./LoadingSpinner.module.css"
import {TsClosureComponent} from "../../mithril-polyfill.ts";

interface Attributes {
	class?: string
}

/**
 * Shows a loading animation.
 */
export default TsClosureComponent<Attributes>((vNode) => {
	return {
		view: () => (
			<div {...vNode.attrs} class={`${css.LoadingSpinner} ${vNode.attrs.class ?? ""}`}></div>
		)
	}
});