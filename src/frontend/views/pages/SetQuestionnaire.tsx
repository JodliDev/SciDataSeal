import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import {Lang} from "../../singleton/Lang.ts";
import SetQuestionnaireInterface from "../../../shared/data/SetQuestionnaireInterface.ts";
import {SiteTools} from "../../singleton/SiteTools.ts";
import Form from "../structures/Form.tsx";
import GetNewDenotation from "../../../shared/data/GetNewDenotation.ts";
import {tooltip} from "../../actions/floatingMenu.ts";
import {bindPropertyToInput} from "../../actions/bindValueToInput.ts";
import listEntries from "../../actions/listEntries.ts";
import getEntry from "../../actions/getEntry.ts";
import GetEntryInterface from "../../../shared/data/GetEntryInterface.ts";
import generateStringDenotation, {MAX_DENOTATION_NUMBER} from "../../../shared/actions/generateStringDenotation.ts";
import WarnIcon from "../structures/WarnIcon.tsx";

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
		const entry = blockchainAccounts?.[index];
		if(entry) {
			const response = await getData<GetNewDenotation>("/getNewDenotation", `?blockchainAccountId=${entry.id}`);
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
		const index = blockchainAccounts?.findIndex(entry => entry.id == accountId)
		questionnaire.blockchainDenotation = await getDenotation(index ?? 0);
		disableAccountSwitch = false;
		m.redraw();
	}
	
	const id = parseInt(query.get("id") ?? "0");
	const blockchainAccounts = await listEntries("blockchainAccounts");
	const questionnaire: Partial<GetEntryInterface<"questionnaire">["Response"]> = id
		? await getEntry("questionnaire", id) ?? {}
		: {};
	const studyId = questionnaire.studyId ?? parseInt(query.get("studyId") ?? "0");
	const study = await getEntry("study", studyId);
	const originalDenotation = questionnaire?.blockchainDenotation;
	const originalBlockchainAccount = questionnaire?.blockchainAccountId;
	
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
				{label: Lang.get("changeSettings"), page: "SetQuestionnaire", query: `?id=${id}`},
			]
			: [
				{label: Lang.get("home"), page: "Home"},
				{label: Lang.get("studies"), page: "ListStudies"},
				{label: study?.studyName ?? "Not found", page: "Study", query: `?id=${studyId}`},
				{label: Lang.get("questionnaires"), page: "ListQuestionnaires", query: `?studyId=${studyId}`},
				{label: Lang.get("createQuestionnaire"), page: "SetQuestionnaire", query: `?studyId=${studyId}`},
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
					<div class="inputLike horizontal vAlignCenter">
						{originalBlockchainAccount != undefined && originalBlockchainAccount != questionnaire.blockchainAccountId &&
							<WarnIcon tooltip={Lang.get("warnChangingBlockchainAccount")}/>
						}
						<select name="blockchainAccountId" disabled={disableAccountSwitch} {...bindPropertyToInput(questionnaire, "blockchainAccountId", {change: changeAccount})}>
							{blockchainAccounts?.map(entry =>
								<option value={entry.id}>{entry.label}</option>
							)}
						</select>
					</div>
				</label>
				<label>
					<small>{Lang.get("denotation")}</small>
					<div class="inputLike horizontal vAlignCenter">
						{originalDenotation != undefined && originalDenotation != questionnaire.blockchainDenotation &&
							<WarnIcon tooltip={Lang.get("warnChangingDenotation")}/>
						}
						<input type="number" min="1" max={MAX_DENOTATION_NUMBER} name="blockchainDenotation" {...bindPropertyToInput(questionnaire, "blockchainDenotation")} {...tooltip(Lang.get("tooltipDenotation"))}/>
						<span {...tooltip(Lang.get("tooltipStringDenotation"))}>({generateStringDenotation(questionnaire.blockchainDenotation ?? 0)})</span>
					</div>
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