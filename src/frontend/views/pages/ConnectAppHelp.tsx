import {PrivatePage} from "../../PageComponent.ts";
import m, {Child} from "mithril";
import {Lang} from "../../singleton/Lang.ts";
import css from "./ConnectAppHelp.module.css";
import TabBar from "../structures/TabView.tsx";
import {FeedbackCallBack} from "../structures/FeedbackIcon.tsx";
import SetQuestionnaireInterface from "../../../shared/data/SetQuestionnaireInterface.ts";
import {tooltip} from "../../actions/floatingMenu.ts";
import {SetQuestionnaireColumnsInterface} from "../../../shared/data/SetQuestionnaireColumnsInterface.ts";
import {SaveDataInterface} from "../../../shared/data/SaveDataInterface.ts";
import listEntries from "../../actions/listEntries.ts";
import {ListResponseType} from "../../../shared/data/ListEntriesInterface.ts";
import getEntry from "../../actions/getEntry.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	function createQuestionnaireMenu(questionnaires: ListResponseType<"questionnaires">) {
		async function onChange(event: Event) {
			const target = event.target as HTMLSelectElement;
			feedback.setLoading(true);
			const q = await getEntry("questionnaire", parseInt(target.value));
			
			if(q) {
				questionnaire = q;
			}
			feedback.setLoading(false);
		}
		
		return <div class="horizontal vAlignCenter fullLine hAlignEnd">
			<b>{Lang.getWithColon("questionnaire")}</b>
			<select onchange={onChange}>
				{questionnaires.map(questionnaire =>
					<option value={questionnaire.id}>{questionnaire.label}</option>
				)}
			</select>
		</div>
	}
	
	function formatData(content: string): Child {
		return <pre class={css.data}>{content}</pre>;
	}
	function formatOptional(content: string, tooltipText?: string): Child {
		tooltipText = tooltipText ? `${Lang.get("optional")}. ${tooltipText}` : Lang.get("optional");
		
		return <pre class={css.optional} {...tooltip(tooltipText)}>{content}</pre>;
	}
	
	const feedback = new FeedbackCallBack();
	const studyId = parseInt(query.get("studyId") ?? "0");
	const study = await getEntry("study", studyId);
	const questionnaires = (await listEntries("questionnaires", `?studyId=${studyId}`));
	const loadedQuestionnaire = (await getEntry("questionnaire", questionnaires?.[0].id ?? 0));
	
	const createQuestionnaireUrl = window.location.origin + "/api" + ("/setQuestionnaire" satisfies SetQuestionnaireInterface["Endpoint"]);
	const saveDataUrl = window.location.origin + "/api" + ("/saveData" satisfies SaveDataInterface["Endpoint"]);
	const setColumnsUrl = window.location.origin + "/api" + ("/setQuestionnaireColumns" satisfies SetQuestionnaireColumnsInterface["Endpoint"]);
	
	if(!study || !questionnaires || !loadedQuestionnaire) {
		return {
			history: [],
			view: () => <div class="selfAlignCenter">{Lang.get("notFound")}</div>
		};
	}
	
	let questionnaire = loadedQuestionnaire;
	
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("studies"), page: "ListStudies"},
			{label: study?.studyName ?? "Not found", page: "Study", query: `?id=${studyId}`},
			{label: Lang.get("howToConnect"), page: "ConnectAppHelp", query: `?studyId=${studyId}`},
		],
		view: () => <div class="vertical">
			<TabBar tabs={[
				{
					label: Lang.get("createQuestionnaire"),
					tooltip: Lang.get("tooltipCreateQuestionnaire"),
					view: () =>
						<div>
							<h3>POST</h3>
							<div class="labelLike">
								<small>{Lang.get("url")}</small>
								<pre class={`${css.box} inputLike`}>{createQuestionnaireUrl}</pre>
							</div>
							<div class="labelLike">
								<small>{Lang.get("body")}</small>
								<pre class={`${css.box} inputLike`}>
									&#123;
									<br/>&nbsp;&nbsp;"studyId": {studyId},
									<br/>&nbsp;&nbsp;"apiPassword": {study.apiPassword},
									<br/>&nbsp;&nbsp;"questionnaireName": {formatData('"A questionnaire"')},
									<br/>&nbsp;&nbsp;{formatOptional('"dataKey": "ThisIsASavePassword"', Lang.get("tooltipDataKey"))}
									<br/>&#125;
									</pre>
							</div>
						</div>
				},
				
				{
					label: Lang.get("setColumns"),
					tooltip: Lang.get("tooltipSetColumns"),
					view: () =>
						<div>
							{createQuestionnaireMenu(questionnaires)}
							<h3>POST</h3>
							<div class="labelLike">
								<small>{Lang.get("url")}</small>
								<pre class={`${css.box} inputLike`}>{setColumnsUrl}</pre>
							</div>
							<div class="labelLike">
								<small>{Lang.get("body")}</small>
								<pre class={`${css.box} ${css.postDataBox} inputLike`}>
										&#123;
									<br/>&nbsp;&nbsp;"id": {questionnaire.questionnaireId},
									<br/>&nbsp;&nbsp;"pass": "{study.apiPassword}",
									<br/>&nbsp;&nbsp;"columns": {formatData('["column1", "column2"]')}
									<br/>&#125;
									</pre>
							</div>
						</div>
				},
				{
					label: Lang.get("saveData"),
					tooltip: Lang.get("tooltipSaveData"),
					view: () =>
						<div>
							{createQuestionnaireMenu(questionnaires)}
							<h3>POST</h3>
							<div class="labelLike">
								<small>{Lang.get("url")}</small>
								<pre class={`${css.box} inputLike`}>{saveDataUrl}</pre>
							</div>
							<div class="labelLike">
								<small>POST</small>
								<pre class={`${css.box} ${css.postDataBox} inputLike`}>
										&#123;
									<br/>&nbsp;&nbsp;"id": {questionnaire.questionnaireId},
									<br/>&nbsp;&nbsp;"pass": "{study.apiPassword}",
									<br/>&nbsp;&nbsp;"data": {formatData('{"column1":"data", "column2":"more data"}')}
										<br/>&#125;
									</pre>
							</div>
						</div>
				}
			]}/>
		</div>
	};
});