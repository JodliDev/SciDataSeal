import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import ListQuestionnairesInterface from "../../../shared/data/ListQuestionnairesInterface.ts";
import A from "../widgets/A.tsx";
import {Lang} from "../../singleton/Lang.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	const response = await getData<ListQuestionnairesInterface>("/listQuestionnaires");
	
	return {
		history: [
			{label: Lang.get("admin"), page: "Admin"},
			{label: Lang.get("listQuestionnaires"), page: "ListQuestionnaires"},
		],
		view: () => <div class="horizontal vAlignCenter hAlignCenter wrapContent">
			{response?.questionnaires.map(questionnaire =>
				<A class="bigButton" page="Questionnaire" query={`?id=${questionnaire.questionnaireId}`}>{questionnaire.questionnaireName}</A> )}
		</div>
	};
});