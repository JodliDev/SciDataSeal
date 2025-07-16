import m from "mithril"
import css from "./LoadingSpinner.module.css"
import {FixedComponent} from "../../mithril-polyfill.ts";

interface Attributes {
	visible?: boolean;
	reserveSpace?: boolean
}

export default FixedComponent<Attributes>(({ attrs: { visible, reserveSpace } }) => {
	return {
		view: () => (
			<div class={`${css.LoadingSpinner} ${visible ? "" : css.hidden} ${reserveSpace ? css.reserveSpace : ""}`}></div>
		)
	}
});