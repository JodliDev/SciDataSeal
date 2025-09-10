import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import {Lang} from "../../singleton/Lang.ts";
import A from "../structures/A.tsx";
import {tooltip} from "../../actions/floatingMenu.ts";
import Icon from "../structures/Icon.tsx";
import {SiteTools} from "../../singleton/SiteTools.ts";
import {FeedbackCallBack} from "../structures/FeedbackIcon.tsx";
import getData from "../../actions/getData.ts";
import ManuallySyncBlockchain from "../../../shared/data/ManuallySyncBlockchain.ts";
import FeedbackContent from "../structures/FeedbackContent.tsx";
import {doLogout} from "../../actions/doLogout.ts";
import LogoutInterface from "../../../shared/data/LogoutInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	const syncBlockchainFeedback = new FeedbackCallBack();
	async function syncBlockchainNow() {
		try {
			syncBlockchainFeedback.setLoading(true);
			const response = await getData<ManuallySyncBlockchain>("/syncBlockchainNow");
			syncBlockchainFeedback.setSuccess(!!response);
		}
		catch {
			syncBlockchainFeedback.setSuccess(false);
		}
	}
	
	async function logout() {
		await getData<LogoutInterface>("/logout");
		doLogout();
	}
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"}
		],
		view: () => <>
			<div class="horizontal vAlignCenter hAlignCenter wrapContent">
				<A page="ListBlockchainAccounts" class="bigButton" {...tooltip(Lang.get("tooltipBlockchainAccount"))}>
					<Icon iconKey="blockchain"/>
					{Lang.get("blockchainAccounts")}
				</A>
				<A page="ListStudies" class="bigButton" {...tooltip(Lang.get("tooltipStudies"))}>
					<Icon iconKey="list"/>
					{Lang.get("studies")}
				</A>
				<A page="ViewQuestionnaireData" class="bigButton" {...tooltip(Lang.get("tooltipViewQuestionnaireData"))}>
					<Icon iconKey="view"/>
					{Lang.get("viewData")}
				</A>
				{!!SiteTools.session.isAdmin &&
					<A page="ListUsers" class="bigButton">
						<Icon iconKey="userList"/>
						{Lang.get("listUsers")}
					</A>
				}
			</div>
			<div class="fillSpace"></div>
			<div class="horizontal buttonHeight">
				{!!SiteTools.session.isAdmin &&
					<FeedbackContent callback={syncBlockchainFeedback} waitForSuccessDelay={true}>
						<div class="clickable" {...tooltip(Lang.get("tooltipSyncBlockchainNow"))} onclick={syncBlockchainNow}>
							<Icon iconKey="sync"/>
						</div>
					</FeedbackContent>
				}
				<div class="fillSpace"></div>
				<A page="UserSettings" class="clickable" {...tooltip(Lang.get("tooltipUserSettingsDesc"))}>
					<Icon iconKey="userSettings"/>
				</A>
				<div class="clickable" onclick={logout} {...tooltip(Lang.get("logout"))}>
					<Icon iconKey="logout"/>
				</div>
			</div>
		</>
	};
});