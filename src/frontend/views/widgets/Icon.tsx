import addSvg from "../../assets/icons/add.svg?raw";
import blockchainSvg from "../../assets/icons/blockchain.svg?raw";
import columnsSvg from "../../assets/icons/columns.svg?raw";
import connectAppSvg from "../../assets/icons/connectApp.svg?raw";
import deleteSvg from "../../assets/icons/delete.svg?raw";
import listSvg from "../../assets/icons/list.svg?raw";
import logsSvg from "../../assets/icons/logs.svg?raw";
import nextSvg from "../../assets/icons/next.svg?raw";
import openInNewSvg from "../../assets/icons/openInNew.svg?raw";
import prevSvg from "../../assets/icons/prev.svg?raw";
import removeSvg from "../../assets/icons/remove.svg?raw";
import saveSvg from "../../assets/icons/save.svg?raw";
import settingsSvg from "../../assets/icons/settings.svg?raw";
import toEndSvg from "../../assets/icons/toEnd.svg?raw";
import toStartSvg from "../../assets/icons/toStart.svg?raw";
import userListSvg from "../../assets/icons/userList.svg?raw";
import userSettingsSvg from "../../assets/icons/userSettings.svg?raw";
import viewSvg from "../../assets/icons/view.svg?raw";
import warnSvg from "../../assets/icons/warn.svg?raw";
import m from "mithril";
import {TsClosureComponent} from "../../mithril-polyfill.ts";

const IconType = {
	add: addSvg,
	blockchain: blockchainSvg,
	columns: columnsSvg,
	connectApp: connectAppSvg,
	delete: deleteSvg,
	list: listSvg,
	logs: logsSvg,
	next: nextSvg,
	openInNew: openInNewSvg,
	prev: prevSvg,
	remove: removeSvg,
	save: saveSvg,
	settings: settingsSvg,
	toEnd: toEndSvg,
	toStart: toStartSvg,
	userList: userListSvg,
	userSettings: userSettingsSvg,
	view: viewSvg,
	warn: warnSvg,
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