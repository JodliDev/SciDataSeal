import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import GetQuestionnaireInterface from "../../../shared/data/GetQuestionnaireInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import A from "../widgets/A.tsx";
import {tooltip} from "../../actions/FloatingMenu.tsx";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	const id = query.get("id");
	const questionnaire = await getData<GetQuestionnaireInterface>("/getQuestionnaire", `?questionnaireId=${id}`);
	
	return {
		history: [
			{label: Lang.get("admin"), page: "Admin"},
			{label: Lang.get("listQuestionnaires"), page: "ListQuestionnaires"},
			{label: questionnaire?.questionnaireName ?? "Not found", page: "Questionnaire", query: `?id=${id}`},
		],
		view: () => <div class="horizontal hAlignCenter wrapContent">
			{questionnaire
				? <>
					<A page="SaveData" query={`?id=${id}`} class="bigButton" {...tooltip(Lang.get("tooltipSaveData"))}>
						{Lang.get("saveData")}
					</A>
					<A page="SetColumns" query={`?id=${id}`} class="bigButton" {...tooltip(Lang.get("tooltipSetColumns"))}>
						{Lang.get("setColumns")}
					</A>
					<A page="ConnectAppHelp" query={`?id=${id}`} class="bigButton" {...tooltip(Lang.get("tooltipConnectAppHelp"))}>
						{Lang.get("howToConnectMyApp")}
					</A>
					<A page="EditQuestionnaire" query={`?id=${id}`} class="bigButton">
						{Lang.get("changeQuestionnaireSettings")}
					</A>
				</>
				: <div class="selfAlignCenter">{Lang.get("notFound")}</div>
			}
		</div>
	};
});