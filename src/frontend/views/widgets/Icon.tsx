import addSvg from "../../assets/icons/add.svg?raw";
import blockchainSvg from "../../assets/icons/blockchain.svg?raw";
import deleteSvg from "../../assets/icons/delete.svg?raw";
import listSvg from "../../assets/icons/list.svg?raw";
import removeSvg from "../../assets/icons/remove.svg?raw";
import userListSvg from "../../assets/icons/userList.svg?raw";
import userSettingsSvg from "../../assets/icons/userSettings.svg?raw";
import viewSvg from "../../assets/icons/view.svg?raw";
import m from "mithril";
import {TsClosureComponent} from "../../mithril-polyfill.ts";

const IconType = {
	add: addSvg,
	blockchain: blockchainSvg,
	delete: deleteSvg,
	list: listSvg,
	remove: removeSvg,
	userList: userListSvg,
	userSettings: userSettingsSvg,
	view: viewSvg,
}

export interface IconAttributes {
	iconKey: keyof typeof IconType,
}

/**
 * Shows a svg icon.
 */
export default TsClosureComponent<IconAttributes>(() => {
	return {
		view: (vNode) => m.trust(IconType[vNode.attrs.iconKey])
	}
});