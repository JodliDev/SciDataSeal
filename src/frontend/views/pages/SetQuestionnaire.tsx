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
	async function getDenotation(blockchainAccountId: number): Promise<number | undefined> {
		const response = await getData<GetNewDenotation>("/getNewDenotation", `?blockchainAccountId=${blockchainAccountId}`);
		return response?.denotation;
	}
	
	const id = parseInt(query.get("id") ?? "0");
	const questionnaire: Partial<GetEntryInterface<"questionnaire">["Response"]> = id
		? await getEntry("questionnaire", id) ?? {}
		: {};
	const studyId = questionnaire.studyId ?? parseInt(query.get("studyId") ?? "0");
	const study = await getEntry("study", studyId);
	const originalDenotation = questionnaire?.blockchainDenotation;
	
	
	if(!id) {
		questionnaire.blockchainDenotation = await getDenotation(questionnaire.blockchainAccountId ?? 0);
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
				<input type="hidden" name="apiPassword" value={study?.apiPassword}/>
				<label>
					<small>{Lang.get("questionnaireName")}</small>
					<input type="text" name="questionnaireName" {...bindPropertyToInput(questionnaire, "questionnaireName")}/>
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
			</Form>
	};
});