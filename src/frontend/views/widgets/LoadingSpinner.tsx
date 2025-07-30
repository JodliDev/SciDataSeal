import m from "mithril"
import css from "./LoadingSpinner.module.css"
import {FixedComponent} from "../../mithril-polyfill.ts";

interface Attributes {
}

export default FixedComponent<Attributes>(() => {
	return {
		view: () => (
			<div class={css.LoadingSpinner}></div>
		)
	}
});