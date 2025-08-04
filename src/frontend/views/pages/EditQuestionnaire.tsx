import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import GetQuestionnaireInterface from "../../../shared/data/GetQuestionnaireInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import EditQuestionnaireInterface from "../../../shared/data/EditQuestionnaireInterface.ts";
import {SiteTools} from "../../singleton/SiteTools.ts";
import ListBlockchainAccountsInterface from "../../../shared/data/ListBlockchainAccountsInterface.ts";
import Form from "../widgets/Form.tsx";
import GetNewDenotation from "../../../shared/data/GetNewDenotation.ts";
import GenerateRandomString from "../../../shared/data/GenerateRandomString.ts";
import {tooltip} from "../../actions/FloatingMenu.tsx";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	async function onSent(response: EditQuestionnaireInterface["Response"]): Promise<void> {
		SiteTools.switchPage("Questionnaire", `?id=${response.questionnaireId}`);
	}
	function onDeleted() {
		SiteTools.switchPage("ListQuestionnaires");
	}
	async function getDenotation(index: number): Promise<number | undefined> {
		const entry = blockchainResponse?.accounts[index];
		if(entry) {
			const response = await getData<GetNewDenotation>("/getNewDenotation", `?blockchainAccountId=${entry.blockchainAccountId}`);
			return response?.denotation;
		}
	}
	async function changeAccount(event: Event) {
		if(id)
			return;
		
		const target = event.target as HTMLSelectElement;
		disableAccountSwitch = true;
		m.redraw();
		const accountId = parseInt(target.value);
		const index = blockchainResponse?.accounts.findIndex(entry => entry.blockchainAccountId == accountId)
		denotation = await getDenotation(index ?? 0);
		disableAccountSwitch = false;
		m.redraw();
	}
	const blockchainResponse = await getData<ListBlockchainAccountsInterface>("/listBlockchainAccounts");
	
	const id = parseInt(query.get("id") ?? "0");
	const questionnaire: GetQuestionnaireInterface["Response"] | undefined = id
		? await getData<GetQuestionnaireInterface>("/getQuestionnaire", `?questionnaireId=${id}`)
		: undefined;
	
	let denotation = questionnaire?.blockchainDenotation;
	let apiPassword = questionnaire?.apiPassword;
	let dataKey = questionnaire?.dataKey;
	let disableAccountSwitch = false;
	
	if(!id) {
		denotation = await getDenotation(0);
		apiPassword = (await getData<GenerateRandomString>("/generateRandomString"))?.generatedString;
		dataKey = apiPassword;
	}
	
	return {
		history: id
			? [
				{label: Lang.get("home"), page: "Home"},
				{label: Lang.get("questionnaires"), page: "ListQuestionnaires"},
				{label: questionnaire?.questionnaireName ?? "Not found", page: "Questionnaire", query: `?id=${id}`},
			]
			: [
				{label: Lang.get("home"), page: "Home"},
				{label: Lang.get("createQuestionnaire"), page: "Questionnaire"},
			],
		view: () =>
			<Form<EditQuestionnaireInterface> id={id} endpoint="/editQuestionnaire" deleteEndPoint="/deleteQuestionnaire" onSent={onSent} onDeleted={onDeleted}>
				<label>
					<small>{Lang.get("questionnaireName")}</small>
					<input type="text" name="questionnaireName" value={questionnaire?.questionnaireName}/>
				</label>
				<label>
					<small>{Lang.get("blockchainAccount")}</small>
					<select name="blockchainAccountId" value={questionnaire?.blockchainAccountId} onchange={changeAccount} disabled={disableAccountSwitch}>
						{blockchainResponse?.accounts.map(entry =>
							<option value={entry.blockchainAccountId}>{entry.blockchainName}</option>
						)}
					</select>
				</label>
				<label {...tooltip(Lang.get("tooltipDenotation"))}>
					<small>{Lang.get("denotation")}</small>
					<input type="number" min="1" name="blockchainDenotation" value={denotation}/>
				</label>
				<label {...tooltip(Lang.get("tooltipApiPassword"))}>
					<small>{Lang.get("apiPassword")}</small>
					<textarea name="apiPassword">{apiPassword ?? ""}</textarea>
				</label>
				<label {...tooltip(Lang.get("tooltipDataKey"))}>
					<small>{Lang.get("dataKey")}</small>
					<textarea name="dataKey">{dataKey ?? ""}</textarea>
				</label>
			</Form>
	};
});