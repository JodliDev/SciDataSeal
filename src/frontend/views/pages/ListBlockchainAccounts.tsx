import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import A from "../widgets/A.tsx";
import ListBlockchainAccountsInterface from "../../../shared/data/ListBlockchainAccountsInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	const response = await getData<ListBlockchainAccountsInterface>("/listBlockchainAccounts");
	
	return {
		history: [["Admin"], ["ListBlockchainAccounts"]],
		view: () => <div class="horizontal vAlignCenter hAlignCenter wrapContent">
			{response?.accounts.map(entry =>
				<A class="bigButton" page="BlockchainAccount" query={`?id=${entry.blockchainAccountId}`}>{entry.blockchainName}</A> )}
		</div>
	};
});