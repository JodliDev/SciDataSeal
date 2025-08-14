import m from "mithril";
import {TsClosureComponent} from "../../mithril-polyfill.ts";
import css from "./TabView.module.css";
import {tooltip} from "../../actions/FloatingMenu.ts";

interface TabContent {
	label: string;
	tooltip?: string;
	view: () => m.Child;
}

interface Attributes {
	tabs: TabContent[],
}

/**
 * A View with a tab row at the top and the selected content below
 */
export default TsClosureComponent<Attributes>((vNode) => {
	const onClick = (index: number) => {
		current = index;
		m.redraw();
	}
	if(!vNode.attrs.tabs.length) {
		console.error("TabView needs at least one tab");
		return {view: () => ""};
	}
	let current = 0;
	
	return {
		view: (newVNode) => {
			vNode = newVNode;
			return <div class={`${css.TabView} vertical`}>
				<div class={`${css.tabBar} horizontal hAlignCenter wrapContent`}>
					{vNode.attrs.tabs.map((tab, index) =>
						<div class={`${css.tab} clickable ${index === current ? css.current : ""}`} onclick={() => onClick(index)} {...(tab.tooltip ? tooltip(tab.tooltip) : {})}>
							{tab.label}
						</div>
					)}
				</div>
				
				<div class={css.tabContent}>
				{vNode.attrs.tabs[current].view()}
				</div>
			</div>
		}
	};
});
