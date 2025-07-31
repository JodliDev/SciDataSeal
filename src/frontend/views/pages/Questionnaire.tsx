import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import GetQuestionnaireInterface from "../../../shared/data/GetQuestionnaireInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import A from "../widgets/A.tsx";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	const id = query.get("id");
	const questionnaire = await getData<GetQuestionnaireInterface>("/getQuestionnaire", `?questionnaireId=${id}`);
	
	return {
		history: [
			{label: Lang.get("admin"), page: "Admin"},
			{label: Lang.get("listQuestionnaires"), page: "ListQuestionnaires"},
			{label: questionnaire?.questionnaireName ?? "Not found", page: "Questionnaire", query: `?id=${id}`},
		],
		view: () => <div class="horizontal wrapContent">
			{questionnaire
				? <>
					<A page="ManuallySaveData" query={`?id=${id}`} class="bigButton">{Lang.get("saveData")}</A>
					<A page="ManuallySetColumns" query={`?id=${id}`} class="bigButton">{Lang.get("setColumns")}</A>
					<A page="ConnectAppHelp" query={`?id=${id}`} class="bigButton">{Lang.get("howToConnectMyApp")}</A>
				</>
				: <div class="selfAlignCenter">{Lang.get("notFound")}</div>
			}
		</div>
	};
});