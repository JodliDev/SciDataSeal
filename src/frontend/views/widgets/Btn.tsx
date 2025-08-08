import m from "mithril"
import css from "./btn.module.css"
import {FixedComponent} from "../../mithril-polyfill.ts";
import {tooltip} from "../../actions/FloatingMenu.ts";
import Icon, {IconAttributes} from "./Icon.tsx";

interface BtnAttributes extends IconAttributes{
	onclick?: () => void,
	label?: string,
	class?: string
}

/**
 * A button with an icon and an optional label
 */
const Default = FixedComponent<BtnAttributes>(() => {
	return {
		view: (vNode) => <div {...vNode.attrs} class={`${css.Btn} ${vNode.attrs.iconKey} ${vNode.attrs.class ?? ""} clickable horizontal hAlignCenter vAlignCenter`} onclick={vNode.attrs.onclick}>
			<Icon iconKey={vNode.attrs.iconKey}/>
			{!!vNode.attrs.label && vNode.attrs.label}
		</div>
	}
});

interface TooltipAttributes extends BtnAttributes{
	description: string
}

/**
 * A default button with a mouseover tooltip
 */
const TooltipBtn = FixedComponent<TooltipAttributes>(() => {
	return {
		view: (vNode) =>
			<Default {...vNode.attrs} {...tooltip(vNode.attrs.description)} iconKey={vNode.attrs.iconKey} onclick={vNode.attrs.onclick}/>
	}
});

/**
 * Empty space in the size of a button
 */
const Empty = FixedComponent<{}>(() => {
	return {
		view: () => <div class={`${css.Btn} ${css.empty}`}></div>
	}
});

export const Btn = {Default, TooltipBtn: TooltipBtn, Empty};