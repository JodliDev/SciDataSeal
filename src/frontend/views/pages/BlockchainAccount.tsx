import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import SetBlockchainInterface from "../../../shared/data/SetBlockchainInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import Form from "../structures/Form.tsx";
import {SiteTools} from "../../singleton/SiteTools.ts";
import {tooltip} from "../../actions/floatingMenu.ts";
import bindValueToInput, {bindPropertyToInput} from "../../actions/bindValueToInput.ts";
import getEntry from "../../actions/getEntry.ts";
import GetEntryInterface from "../../../shared/data/GetEntryInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	async function onSent(response: SetBlockchainInterface["Response"]) {
		if(response.mnemonic) {
			mnemonic = response.mnemonic;
			m.redraw();
		}
	}
	function onDeleted() {
		SiteTools.switchPage("ListBlockchainAccounts");
	}
	
	const id = parseInt(query.get("id") ?? "0");
	const updateMode = !!id;
	let useExisting = false;
	let mnemonic: string | undefined = undefined;
	
	const account: Partial<GetEntryInterface<"blockchainAccount">["Response"]> = updateMode
		? (await getEntry("blockchainAccount", id)) ?? {}
		: {};
	
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("blockchainAccounts"), page: "ListBlockchainAccounts"},
			updateMode
				? {label: Lang.get("changeBlockchainAccount"), page: "BlockchainAccount", query: `?id=${id}`}
				: {label: Lang.get("createBlockchainAccount"), page: "BlockchainAccount"}
		],
		view: () => mnemonic
			? <div class="vertical hAlignCenter">
				<span>{Lang.get("infoMnemonic")}</span>
				<div class="labelLike">
					<small>{Lang.get("mnemonic")}</small>
					<pre class="inputLike">{mnemonic}</pre>
				</div>
				<button onclick={() => SiteTools.switchPage("Home")}>{Lang.get("done")}</button>
			</div>
			: <Form<SetBlockchainInterface> id={id} endpoint="/setBlockchainAccount" addDeleteBtnFor={updateMode ? "blockchainAccount" : undefined} onSent={onSent} onDeleted={onDeleted}>
				<label>
					<small>{Lang.get("blockchainName")}</small>
					<input type="text" name="blockchainName" {...bindPropertyToInput(account, "blockchainName")}/>
				</label>
				{!updateMode &&
					<>
						<label>
							<small>{Lang.get("type")}</small>
							<select name="blockchainType" {...bindPropertyToInput(account, "blockchainType")}>
								<option value="solana">{Lang.get("solana")}</option>
								<option value="solanaTest" selected="selected">{Lang.get("solanaTest")}</option>
							</select>
						</label>
						<label>
							<small>{Lang.get("useExisting")}</small>
							<input type="checkbox" name="useExisting" {...bindValueToInput(useExisting, newValue => useExisting = newValue)}/>
						</label>
						{useExisting &&
							<label {...tooltip(Lang.get("tooltipBlockchainPrivateKey"))}>
								<small>{Lang.get("mnemonic")}</small>
								<textarea name="mnemonic"></textarea>
							</label>
						}
					</>
				}
			</Form>
	};
});