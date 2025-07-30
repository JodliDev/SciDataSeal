import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import {Lang} from "../../singleton/Lang.ts";
import A from "../widgets/A.tsx";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	return {
		history: [
			{label: Lang.get("admin"), page: "Admin"}
		],
		view: () => <div class="horizontal vAlignCenter hAlignCenter wrapContent">
			<A page="BlockchainAccount" class="bigButton">{Lang.get("createBlockchainAccount")}</A>
			<A page="ListBlockchainAccounts" class="bigButton">{Lang.get("listBlockchainAccounts")}</A>
			<A page="CreateQuestionnaire" class="bigButton">{Lang.get("createQuestionnaire")}</A>
			<A page="ListQuestionnaires" class="bigButton">{Lang.get("listQuestionnaires")}</A>
		</div>
	};
});