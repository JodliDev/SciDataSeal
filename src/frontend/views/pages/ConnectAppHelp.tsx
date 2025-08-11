import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import GetQuestionnaireInterface from "../../../shared/data/GetQuestionnaireInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import {SaveDataGetInterface} from "../../../shared/data/SaveDataInterface.ts";
import css from "./ConnectAppHelp.module.css";
import TabBar from "../widgets/TabView.tsx";
import {SetQuestionnaireColumnsGetInterface} from "../../../shared/data/SetQuestionnaireColumnsInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	const id = query.get("id");
	const questionnaire = await getData<GetQuestionnaireInterface>("/getQuestionnaire", `?questionnaireId=${id}`);
	const saveDataUrl = window.location.origin + "/api" + ("/saveData" satisfies SaveDataGetInterface["Endpoint"]);
	const setColumnsUrl = window.location.origin + "/api" + ("/setQuestionnaireColumns" satisfies SetQuestionnaireColumnsGetInterface["Endpoint"]);
	const saveDataExample = '{"column1":"data", "column2":"more data"}';
	const setColumnsExample = '["column1", "column2"]';
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("questionnaires"), page: "ListQuestionnaires"},
			{label: questionnaire?.questionnaireName ?? "Not found", page: "Questionnaire", query: `?id=${id}`},
			{label: Lang.get("howToConnectMyApp"), page: "ConnectAppHelp", query: `?id=${id}`},
		],
		view: () => <div class="vertical">
			{questionnaire
				? <>
					<TabBar tabs={[
						{
							label: Lang.get("saveData"),
							view: () =>
								<div>
									{Lang.get("tooltipSaveData")}
									
									<h3>GET</h3>
									<div class="labelLike vertical vAlignCenter">
										<small>{Lang.get("header")}</small>
										<pre class={`${css.box} inputLike`}>Authorization: {questionnaire.apiPassword}</pre>
									</div>
									<div class="labelLike vertical vAlignCenter">
										<small>{Lang.get("url")}</small>
										<pre class={`${css.box} inputLike`}>{`${saveDataUrl}?id=${questionnaire.questionnaireId}&data=`}<pre class={css.data}>{saveDataExample}</pre></pre>
									</div>
									<h3>POST</h3>
									<div class="labelLike vertical vAlignCenter">
										<small>{Lang.get("url")}</small>
										<pre class={`${css.box} inputLike`}>{saveDataUrl}</pre>
									</div>
									<div class="labelLike vertical vAlignCenter">
										<small>{Lang.get("body")}</small>
										<pre class={`${css.box} inputLike`}>
											&#123;
											<br/>&nbsp;&nbsp;"id": {questionnaire.questionnaireId}
											<br/>&nbsp;&nbsp;"pass": {questionnaire.apiPassword}
											<br/>&nbsp;&nbsp;"data": <pre class={css.data}>{saveDataExample}</pre>
											<br/>&#125;
										</pre>
									</div>
								</div>
						},
						{
							label: Lang.get("setColumns"),
							view: () =>
								<div>
									{Lang.get("tooltipSetColumns")}
									
									<h3>GET</h3>
									<div class="labelLike vertical vAlignCenter">
										<small>{Lang.get("header")}</small>
										<pre class={`${css.box} inputLike`}>Authorization: {questionnaire.apiPassword}</pre>
									</div>
									<div class="labelLike vertical vAlignCenter">
										<small>{Lang.get("url")}</small>
										<pre class={`${css.box} inputLike`}>{`${setColumnsUrl}?id=${questionnaire.questionnaireId}&columns=`}<pre class={css.data}>{setColumnsExample}</pre></pre>
									</div>
									<h3>POST</h3>
									<div class="labelLike vertical vAlignCenter">
										<small>{Lang.get("url")}</small>
										<pre class={`${css.box} inputLike`}>{setColumnsUrl}</pre>
									</div>
									<div class="labelLike vertical vAlignCenter">
										<small>{Lang.get("body")}</small>
										<pre class={`${css.box} inputLike`}>
											&#123;
											<br/>&nbsp;&nbsp;"id": {questionnaire.questionnaireId}
											<br/>&nbsp;&nbsp;"pass": {questionnaire.apiPassword}
											<br/>&nbsp;&nbsp;"columns": <pre class={css.data}>{setColumnsExample}</pre>
											<br/>&#125;
										</pre>
									</div>
								</div>
						}
					]}/>
				</>
				: <div class="selfAlignCenter">{Lang.get("notFound")}</div>
			}
		</div>
	};
});