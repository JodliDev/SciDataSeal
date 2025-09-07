import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import {Lang} from "../../singleton/Lang.ts";
import A from "../structures/A.tsx";
import {tooltip} from "../../actions/floatingMenu.ts";
import Icon from "../structures/Icon.tsx";
import getEntry from "../../actions/getEntry.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query) => {
	const id = query.get("id");
	const study = await getEntry("study", parseInt(id ?? "0"));
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("studies"), page: "ListStudies"},
			{label: study?.studyName ?? "Not found", page: "Study", query: `?id=${id}`},
		],
		view: () => <div class="horizontal hAlignCenter wrapContent">
			{study
				? <>
					<A page="ListQuestionnaires" query={`?studyId=${id}`} class="bigButton">
						<Icon iconKey="list"/>
						{Lang.get("questionnaires")}
					</A>
					<A page="ConnectAppHelp" query={`?studyId=${id}`} class="bigButton" {...tooltip(Lang.get("tooltipConnectAppHelp"))}>
						<Icon iconKey="connectApp"/>
						{Lang.get("howToConnect")}
					</A>
					<A page="SetStudy" query={`?id=${id}`} class="bigButton">
						<Icon iconKey="settings"/>
						{Lang.get("changeSettings")}
					</A>
				</>
				: <div class="selfAlignCenter">{Lang.get("notFound")}</div>
			}
		</div>
	};
});