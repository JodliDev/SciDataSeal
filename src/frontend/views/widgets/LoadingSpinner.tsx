import m, {Vnode} from "mithril"
import css from "./LoadingSpinner.module.css"

export function LoadingSpinner({attrs: {visible = true, reserveSpace}}: Vnode<{visible?: boolean, reserveSpace?: boolean}>) {
	return {
		view: () => <div class={`${css.LoadingSpinner} ${visible ? "" : css.hidden} ${reserveSpace ? css.reserveSpace : ""}`}></div>
	};
}
