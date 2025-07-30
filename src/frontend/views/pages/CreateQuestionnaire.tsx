import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import Form from "../widgets/Form.tsx";
import CreateQuestionnaireInterface from "../../../shared/data/CreateQuestionnaireInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import {SiteTools} from "../../singleton/SiteTools.ts";
import getData from "../../actions/getData.ts";
import ListBlockchainAccountsInterface from "../../../shared/data/ListBlockchainAccountsInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	async function onReceive(response: CreateQuestionnaireInterface["Response"]) {
		SiteTools.switchPage("Questionnaire", `?id=${response.questionnaireId}`);
	}
	const response = await getData<ListBlockchainAccountsInterface>("/listBlockchainAccounts");
	
	return{
		history: [
			{label: Lang.get("admin"), page: "Admin"},
			{label: Lang.get("createQuestionnaire"), page: "CreateQuestionnaire"},
		],
		view: () => <Form<CreateQuestionnaireInterface> endpoint="/createQuestionnaire" onReceive={onReceive}>
			<label>
				<small>{Lang.get("questionnaireName")}</small>
				<input type="text" name="questionnaireName"/>
			</label>
			<label>
				<small>{Lang.get("type")}</small>
				<select name="blockchainAccountId">
					{response?.accounts.map(entry =>
						<option value={entry.blockchainAccountId}>{entry.blockchainName}</option>
					)}
				</select>
			</label>
		</Form>
	};
});