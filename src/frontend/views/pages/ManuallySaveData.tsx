import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import Form from "../widgets/Form.tsx";
import {Lang} from "../../singleton/Lang.ts";
import getData from "../../actions/getData.ts";
import GetQuestionnaireInterface from "../../../shared/data/GetQuestionnaireInterface.ts";
import bindValueToInput from "../../actions/bindValueToInput.ts";
import {SetQuestionnaireColumnsPostInterface} from "../../../shared/data/SetQuestionnaireColumnsInterface.ts";
import css from "./ManuallySaveData.module.css";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	const id = query.get("id");
	const questionnaire = await getData<GetQuestionnaireInterface>("/getQuestionnaire", `?questionnaireId=${id}`);
	const columns: string[] = JSON.parse(questionnaire?.columns || "[]");
	const data: Record<string, string> = {};
	
	return {
		history: [["Admin"], ["ListQuestionnaires"], ["Questionnaire", `?id=${id}`], ["ManuallySaveData", `?id=${id}`]],
		view: () => <Form<SetQuestionnaireColumnsPostInterface> endpoint="/saveData" query={`?id=${questionnaire?.questionnaireId}`} headers={{authorization: `Bearer ${questionnaire?.apiPassword}`}}>
			{columns.map(column =>
				<label>
					<div class="horizontal vAlignCenter">
						<span class={css.columnLabel}>{Lang.get("colon", column)}</span>
						<textarea
							placeholder={Lang.get("columnData")}
							name={column}
							{...bindValueToInput(data[column], value => data[column] = value)}
						></textarea>
					</div>
				</label>
			)}
		</Form>
	};
});