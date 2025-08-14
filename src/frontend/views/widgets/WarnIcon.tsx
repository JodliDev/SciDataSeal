import m from "mithril";
import {TsClosureComponent} from "../../mithril-polyfill.ts";
import Icon from "./Icon.tsx";
import {tooltip} from "../../actions/FloatingMenu.ts";

interface Attributes {
	tooltip: string,
}

/**
 * Shows a warning icon with a tooltip.
 */
export default TsClosureComponent<Attributes>(() => {
	return {
		view: (vNode) => {
			return <div class="warn vertical vAlignCenter" {...tooltip(vNode.attrs.tooltip)}>
				<Icon iconKey="warn"/>
			</div>
		}
	};
});
