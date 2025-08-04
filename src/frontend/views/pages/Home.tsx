import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import {Lang} from "../../singleton/Lang.ts";
import A from "../widgets/A.tsx";
import {tooltip} from "../../actions/FloatingMenu.tsx";
import Icon from "../widgets/Icon.tsx";
import {SiteTools} from "../../singleton/SiteTools.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	return {
		history: [
			{label: Lang.get("home"), page: "Home"}
		],
		view: () => <div class="horizontal vAlignCenter hAlignCenter wrapContent">
			<A page="ListBlockchainAccounts" class="bigButton" {...tooltip(Lang.get("tooltipBlockchainAccount"))}>
				<Icon iconKey="blockchain"/>
				{Lang.get("blockchainAccounts")}
			</A>
			<A page="ListQuestionnaires" class="bigButton" {...tooltip(Lang.get("tooltipQuestionnaires"))}>
				<Icon iconKey="list"/>
				{Lang.get("questionnaires")}
			</A>
			<A page="ViewQuestionnaireData" class="bigButton" {...tooltip(Lang.get("tooltipViewQuestionnaireData"))}>
				<Icon iconKey="view"/>
				{Lang.get("viewData")}
			</A>
			{!!SiteTools.session.isAdmin &&
				<A page="ListUser" class="bigButton">
					<Icon iconKey="userList"/>
					{Lang.get("listUser")}
				</A>}
		</div>
	};
});