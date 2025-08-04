import m from "mithril"
import css from "./btn.module.css"
import {FixedComponent} from "../../mithril-polyfill.ts";
import {tooltip} from "../../actions/FloatingMenu.tsx";
import Icon, {IconAttributes} from "./Icon.tsx";

interface BtnAttributes extends IconAttributes{
	onclick?: () => void,
	label?: string,
	class?: string
}

const Default = FixedComponent<BtnAttributes>(() => {
	return {
		view: (vNode) => <div {...vNode.attrs} class={`${css.Btn} ${vNode.attrs.iconKey} ${vNode.attrs.class ?? ""} clickable horizontal hAlignCenter vAlignCenter`} onclick={vNode.attrs.onclick}>
			<Icon iconKey={vNode.attrs.iconKey}/>
			{!!vNode.attrs.label && vNode.attrs.label}
		</div>
	}
});

interface PopoverAttributes extends BtnAttributes{
	description: string
}
const PopoverBtn = FixedComponent<PopoverAttributes>(() => {
	return {
		view: (vNode) =>
			<Default {...vNode.attrs} {...tooltip(vNode.attrs.description)} iconKey={vNode.attrs.iconKey} onclick={vNode.attrs.onclick}/>
	}
});

const Empty = FixedComponent<{}>(() => {
	return {
		view: () => <div class={`${css.Btn} ${css.empty}`}></div>
	}
});

export const Btn = {Default, PopoverBtn, Empty};