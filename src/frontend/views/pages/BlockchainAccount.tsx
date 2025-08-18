import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import SetBlockchainInterface from "../../../shared/data/SetBlockchainInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import Form from "../widgets/Form.tsx";
import {SiteTools} from "../../singleton/SiteTools.ts";
import {tooltip} from "../../actions/floatingMenu.ts";
import {bindPropertyToInput} from "../../actions/bindValueToInput.ts";
import getEntry from "../../actions/getEntry.ts";
import GetEntryInterface from "../../../shared/data/GetEntryInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	async function onSent(response: SetBlockchainInterface["Response"]) {
		if(id != response.blockchainAccountId) {
			SiteTools.switchPage("Home");
		}
	}
	function onDeleted() {
		SiteTools.switchPage("ListBlockchainAccounts");
	}
	const id = parseInt(query.get("id") ?? "0");
	
	const account: Partial<GetEntryInterface<"blockchainAccount">["Response"]> = id
		? (await getEntry("blockchainAccount", id)) ?? {}
		: {};
	
	
	return {
		history: id
			? [
				{label: Lang.get("home"), page: "Home"},
				{label: Lang.get("blockchainAccounts"), page: "ListBlockchainAccounts"},
				{label: Lang.get("changeBlockchainAccount"), page: "BlockchainAccount", query: `?id=${id}`},
			]
			: [
				{label: Lang.get("home"), page: "Home"},
				{label: Lang.get("blockchainAccounts"), page: "ListBlockchainAccounts"},
				{label: Lang.get("createBlockchainAccount"), page: "BlockchainAccount"},
			],
		view: () => <Form<SetBlockchainInterface> id={id} endpoint="/setBlockchainAccount" addDeleteBtnFor={id ? "blockchainAccount" : undefined} onSent={onSent} onDeleted={onDeleted}>
			<label>
				<small>{Lang.get("blockchainName")}</small>
				<input type="text" name="blockchainName" {...bindPropertyToInput(account, "blockchainName")}/>
			</label>
			<label>
				<small>{Lang.get("type")}</small>
				<select name="blockchainType" {...bindPropertyToInput(account, "blockchainType")}>
					<option value="solana">{Lang.get("solana")}</option>
					<option value="solanaTest" selected="selected">{Lang.get("solanaTest")}</option>
				</select>
			</label>
			<label {...tooltip(Lang.get("tooltipBlockchainPrivateKey"))}>
				<small>{Lang.get("privateKey")}</small>
				<textarea name="privateKey">{account.privateKey ?? ""}</textarea>
			</label>
		</Form>
	};
});