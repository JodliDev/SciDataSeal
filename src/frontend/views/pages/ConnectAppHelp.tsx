import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
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

interface ResponseValue {
	key: string;
	value: string;
	tooltip?: string;
}

type objectBuilder = {
	line: (key: string, content: (builder: CodeBuilder) => void) => void
	optional: (key: string, content: (builder: CodeBuilder) => void, tooltipText?: string) => void
};

class CodeBuilder {
	private readonly level: number = 0;
	private readonly push: (child: m.Child) => void;
	
	constructor(level: number, push: (child: m.Child) => void) {
		this.level = level;
		this.push = push;
	}
	
	private indent(level: number) {
		while(level--) {
			this.push(<>&nbsp;&nbsp;</>);
		}
	}
	private key(key: string) {
		this.indent(this.level);
		this.push(`"${key}": `);
	}
	
	private formatValue(content: unknown): string {
		switch(typeof content) {
			case "string":
				return `"${content}"`.toString();
			case "number":
				return `${content}`;
			case "boolean":
				return content ? "true" : "false";
			default:
				return JSON.stringify(content);
		}
	}
	
	public value(content: unknown) {
		this.push(this.formatValue(content));
	}
	public data(content: unknown, tooltipText?: string) {
		this.push(<pre class={css.data} {...(tooltipText ? tooltip(tooltipText) : {})}>{this.formatValue(content)}</pre>);
	}
	public optional(content: (builder: CodeBuilder) => void, tooltipText?: string) {
		tooltipText = tooltipText ? `${Lang.get("optional")}. ${tooltipText}` : Lang.get("optional");
		
		const output: m.Child[] = [];
		const builder = new CodeBuilder(this.level + 1, child => output.push(child));
		content(builder);
		this.push(<pre class={css.optional} {...tooltip(tooltipText)}>{output}</pre>);
	}
	public object(content: (builder: objectBuilder) => void) {
		const lineStructure = (content: () => void) => {
			if(notFirstLine) {
				this.push(",");
			}
			this.push(<br/>);
			
			content();
			
			notFirstLine = true;
		}
		
		this.push("{");
		let notFirstLine = false;
		content({
			line: (key: string, content: (builder: CodeBuilder) => void) => {
				lineStructure(() => {
					const builder = new CodeBuilder(this.level + 1, this.push);
					builder.key(key);
					content(builder);
				});
			},
			optional: (key: string, content: (builder: CodeBuilder) => void, tooltipText?: string) => {
				lineStructure(() => {
					this.optional(builder => {
						builder.key(key);
						content(builder);
					}, tooltipText);
				});
			},
			// optional: line
		});
		this.push(<br/>);
		this.indent(this.level);
		this.push("}");
	}
}


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
	
	function formatCode(title: string, content: (builder: Pick<CodeBuilder, "object">) => void) {
		const output: m.Child[] = [];
		
		const builder = new CodeBuilder(0, child => output.push(child));
		
		content(builder);
		
		return <div class="labelLike">
			<small>{title}</small>
			<pre class={`${css.box} ${css.codeBox} inputLike`}>
			{output}
		</pre>
		</div>
	}
	
	function formatResponse(responseValues: ResponseValue[]) {
		return formatCode(Lang.get("response"), builder => {
			builder.object(obj => {
				obj.line("ok", builder => builder.data("true", Lang.get("tooltipResponseOk")));
				obj.line("data", builder => {
					builder.object(obj => {
						for(const entry of responseValues) {
							obj.line(entry.key, builder => builder.data(entry.value, entry.tooltip));
						}
					});
				});
				
				obj.optional("error", builder => {
					builder.object(obj => {
						obj.line("message", builder => builder.data("errorMissingData", Lang.get("tooltipErrorCode")));
					});
				}, Lang.get("tooltipResponseError"));
			});
		});
	}
	
	const feedback = new FeedbackCallBack();
	const studyId = parseInt(query.get("studyId") ?? "0");
	const study = await getEntry("study", studyId);
	const questionnaires = (await listEntries("questionnaires", `?studyId=${studyId}`));
	const loadedQuestionnaire = (await getEntry("questionnaire", questionnaires?.[0]?.id ?? 0));
	
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
							{formatCode(Lang.get("body"), builder => {
								builder.object(obj => {
									obj.line("studyId", builder => builder.value(5))
									obj.line("apiPassword", builder => builder.value(study.apiPassword))
									obj.line("questionnaireName", builder => builder.data("A questionnaire", Lang.get("tooltipQuestionnaireName")))
								});
							})}
							<br/>
							<br/>
							{formatResponse([
								{key: "questionnaireId", value: "5", tooltip: Lang.get("tooltipQuestionnaireId")}
							])}
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
							{formatCode(Lang.get("body"), builder => {
								builder.object(obj => {
									obj.line("id", builder => builder.value(questionnaire.questionnaireId))
									obj.line("pass", builder => builder.value(study.apiPassword))
									obj.line("columns", builder => builder.data(["column1", "column2"]))
								});
							})}
							<br/>
							<br/>
							{formatResponse([])}
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
							{formatCode(Lang.get("body"), builder => {
								builder.object(obj => {
									obj.line("id", builder => builder.value(questionnaire.questionnaireId))
									obj.line("pass", builder => builder.value(study.apiPassword))
									obj.line("data", builder => builder.data({"column1":"data", "column2":"more data"}))
								});
							})}
							<br/>
							<br/>
							{formatResponse([])}
						</div>
				}
			]}/>
		</div>
	};
});