import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import GetQuestionnaireInterface from "../../../shared/data/GetQuestionnaireInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import A from "../widgets/A.tsx";
import {tooltip} from "../../actions/FloatingMenu.ts";
import GetStudyInterface from "../../../shared/data/GetStudyInterface.ts";
import Icon from "../widgets/Icon.tsx";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	const questionnaireId = query.get("id");
	const questionnaire = await getData<GetQuestionnaireInterface>("/getQuestionnaire", `?questionnaireId=${questionnaireId}`);
	const studyId = questionnaire?.studyId ?? 0;
	const study = await getData<GetStudyInterface>("/getStudy", `?studyId=${studyId}`);
	
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
					<A page="SetColumns" query={`?id=${questionnaireId}`} class="bigButton" {...tooltip(Lang.get("tooltipSetColumns"))}>
						<Icon iconKey="columns"/>
						{Lang.get("setColumns")}
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