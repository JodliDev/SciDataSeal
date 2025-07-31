import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import EditBlockchainInterface from "../../../shared/data/EditBlockchainInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import Form from "../widgets/Form.tsx";
import {SiteTools} from "../../singleton/SiteTools.ts";
import GetBlockchainInterface from "../../../shared/data/GetBlockchainInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	async function onReceive(response: EditBlockchainInterface["Response"]) {
		if(id != response.blockchainAccountId.toString())
			SiteTools.switchPage("BlockchainAccount", `?id=${response.blockchainAccountId}`);
	}
	const id = query.get("id");
	
	const account: Partial<GetBlockchainInterface["Response"]> = id
		? (await getData<GetBlockchainInterface>("/getBlockchainAccount", `?accountId=${id}`)) ?? {}
		: {};
	
	
	return {
		history: id
			? [
				{label: Lang.get("admin"), page: "Admin"},
				{label: Lang.get("listBlockchainAccounts"), page: "ListBlockchainAccounts"},
				{label: Lang.get("changeBlockchainAccount"), page: "BlockchainAccount", query: `?id=${id}`},
			]
			: [
				{label: Lang.get("admin"), page: "Admin"},
				{label: Lang.get("createBlockchainAccount"), page: "BlockchainAccount", query: `?id=${id}`},
			],
		view: () => <Form<EditBlockchainInterface> endpoint="/editBlockchainAccount" onReceive={onReceive}>
			{id &&
				<input type="hidden" name="blockchainAccountId" value={id}/>
			}
			<label>
				<small>{Lang.get("blockchainName")}</small>
				<input type="text" name="blockchainName" value={account?.blockchainName ?? ""}/>
			</label>
			<label>
				<small>{Lang.get("type")}</small>
				<select name="blockchainType" value={account.blockchainType ?? "solana"}>
					<option value="solana">{Lang.get("solana")}</option>
					<option value="solanaTest" selected="selected">{Lang.get("solanaTest")}</option>
				</select>
			</label>
			<label>
				<small>{Lang.get("privateKey")}</small>
				<textarea name="privateKey">{account.privateKey ?? ""}</textarea>
			</label>
		</Form>
	};
});