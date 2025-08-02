import m from "mithril"
import css from "./btn.module.css"
import {FixedComponent} from "../../mithril-polyfill.ts";
import floatingMenu from "../../actions/FloatingMenu.tsx";
import Icon, {IconAttributes} from "./Icon.tsx";

interface BtnAttributes extends IconAttributes{
	onClick?: () => void
}

const Default = FixedComponent<BtnAttributes>(() => {
	return {
		view: (vNode) => <div class={`${css.Btn} ${vNode.attrs.iconKey} clickable horizontal hAlignCenter`} onclick={vNode.attrs.onClick}>
			<Icon iconKey={vNode.attrs.iconKey}/>
		</div>
	}
});

interface PopoverAttributes extends BtnAttributes{
	description: string
}
const PopoverBtn = FixedComponent<PopoverAttributes>(() => {
	return {
		view: (vNode) =>
			<div {...floatingMenu("popoverBtn", () => vNode.attrs.description)}>
				<Default iconKey={vNode.attrs.iconKey} onClick={vNode.attrs.onClick}/>
			</div>
	}
});

const Empty = FixedComponent<{}>(() => {
	return {
		view: () => <div class={`${css.Btn} ${css.empty}`}></div>
	}
});

export const Btn = {Default, PopoverBtn, Empty};