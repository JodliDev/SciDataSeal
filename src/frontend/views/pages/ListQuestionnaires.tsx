import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import ListQuestionnairesInterface from "../../../shared/data/ListQuestionnairesInterface.ts";
import A from "../widgets/A.tsx";
import {Lang} from "../../singleton/Lang.ts";
import Icon from "../widgets/Icon.tsx";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	const response = await getData<ListQuestionnairesInterface>("/listQuestionnaires");
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("questionnaires"), page: "ListQuestionnaires"},
		],
		view: () => <div class="vertical hAlignCenter">
			<A page="ListBlockchainAccounts">
				<Icon iconKey="add"/>
				{Lang.get("createQuestionnaire")}
			</A>
			<br/>
			<div class="horizontal vAlignCenter hAlignCenter wrapContent selfAlignStretch">
				{response?.questionnaires.map(questionnaire =>
					<A class="bigButton" page="Questionnaire" query={`?id=${questionnaire.questionnaireId}`}>{questionnaire.questionnaireName}</A> )}
			</div>
		</div>
	};
});