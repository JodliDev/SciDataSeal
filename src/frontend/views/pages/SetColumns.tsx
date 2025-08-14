import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import Form from "../widgets/Form.tsx";
import {Lang} from "../../singleton/Lang.ts";
import { Btn } from "../widgets/Btn.tsx";
import bindValueToInput from "../../actions/bindValueToInput.ts";
import {SetQuestionnaireColumnsInterface} from "../../../shared/data/SetQuestionnaireColumnsInterface.ts";
import getEntry from "../../actions/getEntry.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	const id = query.get("id");
	function addColumn() {
		columns.push("");
		m.redraw.sync();
		(document.getElementById("lastColumnText") as HTMLInputElement)?.focus();
	}
	function removeColumn(index: number) {
		columns.splice(index, 1);
		m.redraw();
	}
	
	const questionnaire = await getEntry("questionnaire", parseInt(id ?? "0"));
	const columns: string[] = JSON.parse(`[${questionnaire?.columns ?? ""}]`);
	
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("questionnaires"), page: "ListQuestionnaires"},
			{label: questionnaire?.questionnaireName ?? "Not found", page: "Questionnaire", query: `?id=${id}`},
			{label: Lang.get("setColumns"), page: "SetColumns", query: `?id=${id}`},
		],
		view: () => <Form<SetQuestionnaireColumnsInterface> endpoint="/setQuestionnaireColumns" query={`?id=${questionnaire?.questionnaireId}`} headers={{authorization: `Bearer ${questionnaire?.apiPassword}`}}>
			{columns.length
				? columns.map((column, index) =>
					<label>
						<div class="horizontal vAlignCenter">
							<input
								id={index == columns.length - 1 ? "lastColumnText" : ""}
								type="text"
								placeholder={Lang.get("columnName")}
								name="columns[]"
								class={!column ? "warn" : ""}
								{...bindValueToInput(column, value => columns[index] = value)}
							/>
							<Btn.Default iconKey="remove" onclick={() => removeColumn(index)}/>
						</div>
					</label>
				)
				: <div class="warn">{Lang.get("noColumnsInfo")}</div>
			}
			
			<Btn.Default description="test" iconKey="add" onclick={addColumn}/>
		</Form>
	};
});