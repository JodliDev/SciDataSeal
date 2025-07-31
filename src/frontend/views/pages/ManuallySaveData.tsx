import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import Form from "../widgets/Form.tsx";
import {Lang} from "../../singleton/Lang.ts";
import getData from "../../actions/getData.ts";
import GetQuestionnaireInterface from "../../../shared/data/GetQuestionnaireInterface.ts";
import bindValueToInput from "../../actions/bindValueToInput.ts";
import {SetQuestionnaireColumnsPostInterface} from "../../../shared/data/SetQuestionnaireColumnsInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	const id = query.get("id");
	const questionnaire = await getData<GetQuestionnaireInterface>("/getQuestionnaire", `?questionnaireId=${id}`);
	const columns: string[] = JSON.parse(questionnaire?.columns || "[]");
	const data: Record<string, string> = {};
	
	return {
		history: [
			{label: Lang.get("admin"), page: "Admin"},
			{label: Lang.get("listQuestionnaires"), page: "ListQuestionnaires"},
			{label: questionnaire?.questionnaireName ?? "Not found", page: "Questionnaire", query: `?id=${id}`},
			{label: Lang.get("saveData"), page: "ManuallySaveData", query: `?id=${id}`},
		],
		view: () => <Form<SetQuestionnaireColumnsPostInterface> endpoint="/saveData" query={`?id=${questionnaire?.questionnaireId}`} headers={{authorization: `Bearer ${questionnaire?.apiPassword}`}}>
			<div class="horizontal wrapContent">
				{columns.map(column =>
					<label>
						<small>{Lang.get("colon", column)}</small>
						<textarea
							placeholder={Lang.get("columnData")}
							name={column}
							{...bindValueToInput(data[column], value => data[column] = value)}
						></textarea>
					</label>
				)}
			</div>
		</Form>
	};
});