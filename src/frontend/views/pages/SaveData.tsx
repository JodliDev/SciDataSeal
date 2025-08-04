import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import Form from "../widgets/Form.tsx";
import {Lang} from "../../singleton/Lang.ts";
import getData from "../../actions/getData.ts";
import GetQuestionnaireInterface from "../../../shared/data/GetQuestionnaireInterface.ts";
import {SaveDataPostInterface} from "../../../shared/data/SaveDataInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	const id = query.get("id");
	const questionnaire = await getData<GetQuestionnaireInterface>("/getQuestionnaire", `?questionnaireId=${id}`);
	const columns: string[] = JSON.parse(`[${questionnaire?.columns ?? ""}]`);
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("questionnaires"), page: "ListQuestionnaires"},
			{label: questionnaire?.questionnaireName ?? "Not found", page: "Questionnaire", query: `?id=${id}`},
			{label: Lang.get("saveData"), page: "SaveData", query: `?id=${id}`},
		],
		view: () => <Form<SaveDataPostInterface> endpoint="/saveData" query={`?id=${questionnaire?.questionnaireId}`} headers={{authorization: `Bearer ${questionnaire?.apiPassword}`}}>
			<div class="horizontal hAlignCenter wrapContent">
				{columns.map(column =>
					<label>
						<small>{Lang.get("colon", column)}</small>
						<textarea placeholder={Lang.get("columnData")} name={column}></textarea>
					</label>
				)}
			</div>
		</Form>
	};
});