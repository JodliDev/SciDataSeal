import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import Form from "../widgets/Form.tsx";
import {Lang} from "../../singleton/Lang.ts";
import {SaveDataInterface} from "../../../shared/data/SaveDataInterface.ts";
import getEntry from "../../actions/getEntry.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	const id = query.get("id");
	const questionnaire = await getEntry("questionnaire", parseInt(id ?? "0"));
	const columns: string[] = JSON.parse(`[${questionnaire?.columns ?? ""}]`);
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("questionnaires"), page: "ListQuestionnaires"},
			{label: questionnaire?.questionnaireName ?? "Not found", page: "Questionnaire", query: `?id=${id}`},
			{label: Lang.get("saveData"), page: "SaveData", query: `?id=${id}`},
		],
		view: () => <Form<SaveDataInterface> endpoint="/saveData" query={`?id=${questionnaire?.questionnaireId}`} headers={{authorization: `Bearer ${questionnaire?.apiPassword}`}}>
			<div class="horizontal hAlignCenter wrapContent">
				{columns.map(column =>
					<label>
						<small>{column}</small>
						<textarea placeholder={Lang.get("columnData")} name={column}></textarea>
					</label>
				)}
			</div>
		</Form>
	};
});