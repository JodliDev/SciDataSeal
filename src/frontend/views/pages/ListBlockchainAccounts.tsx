import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import {Lang} from "../../singleton/Lang.ts";
import ListEntries, {buttonEntry} from "../widgets/ListEntries.tsx";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("blockchainAccounts"), page: "ListBlockchainAccounts"},
		],
		view: () => <ListEntries
			query={{type: "blockchainAccounts"}}
			drawEntry={buttonEntry("BlockchainAccount")}
			direction="horizontal"
			addLabel={Lang.get("createBlockchainAccount")}
			addTarget="BlockchainAccount"
		/>
	};
});