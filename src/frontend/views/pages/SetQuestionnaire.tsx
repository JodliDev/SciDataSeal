import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import GetQuestionnaireInterface from "../../../shared/data/GetQuestionnaireInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import SetQuestionnaireInterface from "../../../shared/data/SetQuestionnaireInterface.ts";
import {SiteTools} from "../../singleton/SiteTools.ts";
import ListBlockchainAccountsInterface from "../../../shared/data/ListBlockchainAccountsInterface.ts";
import Form from "../widgets/Form.tsx";
import GetNewDenotation from "../../../shared/data/GetNewDenotation.ts";
import {tooltip} from "../../actions/FloatingMenu.ts";
import {bindPropertyToInput} from "../../actions/bindValueToInput.ts";
import GetStudyInterface from "../../../shared/data/GetStudyInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	async function onSent(response: SetQuestionnaireInterface["Response"]): Promise<void> {
		if(id != response.questionnaireId) {
			SiteTools.switchPage("Questionnaire", `?id=${response.questionnaireId}`);
		}
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
		if(id) {
			return;
		}
		
		const target = event.target as HTMLSelectElement;
		disableAccountSwitch = true;
		m.redraw();
		const accountId = parseInt(target.value);
		const index = blockchainResponse?.accounts.findIndex(entry => entry.blockchainAccountId == accountId)
		questionnaire.blockchainDenotation = await getDenotation(index ?? 0);
		disableAccountSwitch = false;
		m.redraw();
	}
	
	const id = parseInt(query.get("id") ?? "0");
	const blockchainResponse = await getData<ListBlockchainAccountsInterface>("/listBlockchainAccounts");
	const questionnaire: Partial<GetQuestionnaireInterface["Response"]> = id
		? await getData<GetQuestionnaireInterface>("/getQuestionnaire", `?questionnaireId=${id}`) ?? {}
		: {};
	const studyId = questionnaire.studyId ?? parseInt(query.get("studyId") ?? "0");
	const study = await getData<GetStudyInterface>("/getStudy", `?studyId=${studyId}`);
	
	let disableAccountSwitch = false;
	
	if(!id) {
		questionnaire.blockchainDenotation = await getDenotation(0);
		questionnaire.apiPassword = study?.apiPassword;
		questionnaire.dataKey = questionnaire.apiPassword
	}
	
	return {
		history: id
			? [
				{label: Lang.get("home"), page: "Home"},
				{label: Lang.get("studies"), page: "ListStudies"},
				{label: study?.studyName ?? "Not found", page: "Study", query: `?id=${studyId}`},
				{label: Lang.get("questionnaires"), page: "ListQuestionnaires", query: `?studyId=${studyId}`},
				{label: questionnaire.questionnaireName ?? "Not found", page: "Questionnaire", query: `?id=${id}`},
			]
			: [
				{label: Lang.get("home"), page: "Home"},
				{label: Lang.get("studies"), page: "ListStudies"},
				{label: study?.studyName ?? "Not found", page: "Study", query: `?id=${studyId}`},
				{label: Lang.get("createQuestionnaire"), page: "Questionnaire"},
			],
		view: () =>
			<Form<SetQuestionnaireInterface> id={id} endpoint="/setQuestionnaire" addDeleteBtnFor={id ? "questionnaire" : undefined} onSent={onSent} onDeleted={onDeleted}>
				<input type="hidden" name="studyId" value={studyId}/>
				<label>
					<small>{Lang.get("questionnaireName")}</small>
					<input type="text" name="questionnaireName" {...bindPropertyToInput(questionnaire, "questionnaireName")}/>
				</label>
				<label>
					<small>{Lang.get("blockchainAccount")}</small>
					<select name="blockchainAccountId" disabled={disableAccountSwitch} {...bindPropertyToInput(questionnaire, "blockchainAccountId", {change: changeAccount})}>
						{blockchainResponse?.accounts.map(entry =>
							<option value={entry.blockchainAccountId}>{entry.blockchainName}</option>
						)}
					</select>
				</label>
				<label {...tooltip(Lang.get("tooltipDenotation"))}>
					<small>{Lang.get("denotation")}</small>
					<input type="number" min="1" name="blockchainDenotation" {...bindPropertyToInput(questionnaire, "blockchainDenotation")}/>
				</label>
				<label {...tooltip(Lang.get("tooltipApiPassword"))}>
					<small>{Lang.get("apiPassword")}</small>
					<textarea name="apiPassword">{questionnaire.apiPassword ?? ""}</textarea>
				</label>
				<label {...tooltip(Lang.get("tooltipDataKey"))}>
					<small>{Lang.get("dataKey")}</small>
					<textarea name="dataKey">{questionnaire.dataKey ?? ""}</textarea>
				</label>
			</Form>
	};
});