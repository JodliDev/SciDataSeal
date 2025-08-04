import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import {Lang} from "../../singleton/Lang.ts";
import A from "../widgets/A.tsx";
import {tooltip} from "../../actions/FloatingMenu.tsx";
import Icon from "../widgets/Icon.tsx";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	return {
		history: [
			{label: Lang.get("home"), page: "Home"}
		],
		view: () => <div class="horizontal vAlignCenter hAlignCenter wrapContent">
			<A page="BlockchainAccount" class="bigButton" {...tooltip(Lang.get("tooltipCreateBlockchainAccount"))}>
				<Icon iconKey="add"/>
				{Lang.get("createBlockchainAccount")}
			</A>
			<A page="ListBlockchainAccounts" class="bigButton">
				<Icon iconKey="list"/>
				{Lang.get("listBlockchainAccounts")}
			</A>
			<A page="EditQuestionnaire" class="bigButton" {...tooltip(Lang.get("tooltipCreateQuestionnaire"))}>
				<Icon iconKey="add"/>
			   {Lang.get("createQuestionnaire")}
			</A>
			<A page="ListQuestionnaires" class="bigButton">
				<Icon iconKey="list"/>
				{Lang.get("listQuestionnaires")}
			</A>
			<A page="ViewQuestionnaireData" class="bigButton" {...tooltip(Lang.get("tooltipViewQuestionnaireData"))}>
				<Icon iconKey="view"/>
				{Lang.get("viewData")}
			</A>
		</div>
	};
});