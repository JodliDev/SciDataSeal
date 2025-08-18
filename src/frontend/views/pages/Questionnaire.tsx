import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import {Lang} from "../../singleton/Lang.ts";
import A from "../widgets/A.tsx";
import {tooltip} from "../../actions/floatingMenu.ts";
import Icon from "../widgets/Icon.tsx";
import getEntry from "../../actions/getEntry.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	const questionnaireId = query.get("id");
	const questionnaire = await getEntry("questionnaire", parseInt(questionnaireId ?? "0"));
	const studyId = questionnaire?.studyId ?? 0;
	const study = await getEntry("study", studyId);
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("studies"), page: "ListStudies"},
			{label: study?.studyName ?? "Not found", page: "Study", query: `?id=${studyId}`},
			{label: Lang.get("questionnaires"), page: "ListQuestionnaires", query: `?studyId=${studyId}`},
			{label: questionnaire?.questionnaireName ?? "Not found", page: "Questionnaire", query: `?id=${questionnaireId}`},
		],
		view: () => <div class="horizontal hAlignCenter wrapContent">
			{questionnaire
				? <>
					<A page="SaveData" query={`?id=${questionnaireId}`} class="bigButton" {...tooltip(Lang.get("tooltipSaveData"))}>
						<Icon iconKey="save"/>
						{Lang.get("saveData")}
					</A>
					<A page="ListDataLogs" query={`?id=${questionnaireId}`} class="bigButton">
						<Icon iconKey="logs"/>
						{Lang.get("showDataLogs")}
					</A>
					<A page="SetColumns" query={`?id=${questionnaireId}`} class="bigButton" {...tooltip(Lang.get("tooltipSetColumns"))}>
						<Icon iconKey="columns"/>
						{Lang.get("setColumns")}
					</A>
					<A page="ViewQuestionnaireData" query={`?qId=${questionnaireId}`} class="bigButton" {...tooltip(Lang.get("tooltipViewQuestionnaireData"))}>
						<Icon iconKey="view"/>
						{Lang.get("viewData")}
					</A>
					<A page="SetQuestionnaire" query={`?id=${questionnaireId}`} class="bigButton">
						<Icon iconKey="settings"/>
						{Lang.get("changeSettings")}
					</A>
				</>
				: <div class="selfAlignCenter">{Lang.get("notFound")}</div>
			}
		</div>
	};
});