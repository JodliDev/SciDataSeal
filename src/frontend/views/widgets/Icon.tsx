import addSvg from "../../assets/icons/add.svg?raw";
import deleteSvg from "../../assets/icons/delete.svg?raw";
import listSvg from "../../assets/icons/list.svg?raw";
import removeSvg from "../../assets/icons/remove.svg?raw";
import viewSvg from "../../assets/icons/view.svg?raw";
import m from "mithril";
import {FixedComponent} from "../../mithril-polyfill.ts";

const IconType = {
	add: addSvg,
	delete: deleteSvg,
	list: listSvg,
	remove: removeSvg,
	view: viewSvg,
}

export interface IconAttributes {
	iconKey: keyof typeof IconType,
}

export default FixedComponent<IconAttributes>(() => {
	return {
		view: (vNode) => m.trust(IconType[vNode.attrs.iconKey])
	}
});