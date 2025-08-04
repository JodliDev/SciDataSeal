import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import GetQuestionnaireInterface from "../../../shared/data/GetQuestionnaireInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import {SaveDataGetInterface} from "../../../shared/data/SaveDataInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	const id = query.get("id");
	const questionnaire = await getData<GetQuestionnaireInterface>("/getQuestionnaire", `?questionnaireId=${id}`);
	const url = window.location.origin + "/api" + ("/saveData" satisfies SaveDataGetInterface["Endpoint"]);
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("howToConnectMyApp"), page: "ConnectAppHelp", query: `?id=${id}`},
		],
		view: () => <div class="vertical">
			{questionnaire
				? <>
					<h2 class="selfAlignCenter">{questionnaire.questionnaireName}</h2>
					{Lang.getWithColon("connectQuestionnaireDescription")}
					<h3>GET</h3>
					<div class="labelLike">
						<small>{Lang.get("url")}</small>
						<pre class="inputLike">{`${url}?id=${questionnaire.questionnaireId}&pass=${questionnaire.apiPassword}&data=`}</pre>
					</div>
					<h3>POST</h3>
					<div class="labelLike">
						<small>{Lang.get("url")}</small>
						<pre class="inputLike">{url}</pre>
					</div>
					<div class="labelLike">
						<small>{Lang.get("body")}</small>
						<pre class="inputLike">{`id=${questionnaire.questionnaireId}&pass=${questionnaire.apiPassword}&data=`}</pre>
					</div>
				</>
				: <div class="selfAlignCenter">{Lang.get("notFound")}</div>
			}
		</div>
	};
});