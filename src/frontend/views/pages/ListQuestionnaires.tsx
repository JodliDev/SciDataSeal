import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import {Lang} from "../../singleton/Lang.ts";
import GetStudyInterface from "../../../shared/data/GetStudyInterface.ts";
import ListEntries from "../widgets/ListEntries.tsx";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query) => {
	const studyId = query.get("studyId");
	const study = await getData<GetStudyInterface>("/getStudy", `?studyId=${studyId}`);
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("studies"), page: "ListStudies"},
			{label: study?.studyName ?? "Not found", page: "Study", query: `?id=${studyId}`},
			{label: Lang.get("questionnaires"), page: "ListQuestionnaires"},
		],
		view: () => <ListEntries
			type="questionnaires"
			query={`?studyId=${studyId}`}
			addLabel={Lang.get("createQuestionnaire")}
			addTarget="SetQuestionnaire"
			addQuery={`?studyId=${studyId}`}
			target="Questionnaire"
		/>
	};
});