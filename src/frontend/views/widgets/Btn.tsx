import m from "mithril"
import css from "./btn.module.css"
import {FixedComponent} from "../../mithril-polyfill.ts";
import FloatingMenu from "./FloatingMenu.tsx";
import addSvg from "../../assets/icons/add.svg?raw";
import removeSvg from "../../assets/icons/remove.svg?raw";

export const ButtonType = {
	add: addSvg,
	remove: removeSvg,
}

interface BtnAttributes {
	iconKey: keyof typeof ButtonType,
	onClick?: () => void
}

const Default = FixedComponent<BtnAttributes>(vNode => {
	return {
		view: () => <div class={`${css.BtnWidget} ${vNode.attrs.iconKey} clickable horizontal hAlignCenter`} onclick={vNode.attrs.onClick}>
			{m.trust(ButtonType[vNode.attrs.iconKey])}
		</div>
	}
});

interface PopoverAttributes extends BtnAttributes{
	description: string
}
const PopoverBtn = FixedComponent<PopoverAttributes>(vNode => {
	return {
		view: () => <FloatingMenu id="popoverBtn" eventName="mousemove" menu={() => vNode.attrs.description}>
			<Default iconKey={vNode.attrs.iconKey} onClick={vNode.attrs.onClick}/>
		</FloatingMenu>
	}
});

const Empty = FixedComponent<{}>(() => {
	return {
		view: () => <div class={`${css.BtnWidget} ${css.empty}`}></div>
	}
});

export const Btn = {Default, PopoverBtn, Empty};