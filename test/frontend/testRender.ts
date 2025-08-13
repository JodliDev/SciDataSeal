import m from "mithril";
import {PageBox} from "../../src/frontend/PageComponent.ts";


export interface RenderModel {
	redraw: () => void;
	dom: HTMLElement;
}
function createModel(rootNode: m.Component): RenderModel {
	const root = window.document.body;
	
	function redraw() {
		m.render(root, m(rootNode));
	}
	redraw();
	
	return {
		redraw: redraw,
		dom: root
	};
}

export function renderComponent<TAttributes extends m.Attributes>(
	component: m.ClosureComponent<TAttributes> | ((attrs: TAttributes) => JSX.Element),
	attrs: TAttributes
): RenderModel {
	const rootNode = {
		view: () => m(component as m.ClosureComponent<TAttributes>, attrs)
	};
	return createModel(rootNode);
}
export function renderVNode(vNode: () => m.Vnode<any, any>): RenderModel {
	const rootNode = {
		view: () => vNode(),
	};
	return createModel(rootNode);
}

export async function renderPage(pageBox: PageBox, query: string = ""): Promise<RenderModel> {
	const page = await pageBox.component(new URLSearchParams(query));
	
	const rootNode = {
		view: () => m(page),
	};
	return createModel(rootNode);
}


export function correctType<TAttributes extends m.Attributes>(fixedComponent: (attrs: TAttributes) => JSX.Element): m.ClosureComponent<TAttributes> {
	return fixedComponent as any;
}