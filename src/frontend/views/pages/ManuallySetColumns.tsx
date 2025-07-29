import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import Form from "../widgets/Form.tsx";
import {Lang} from "../../singleton/Lang.ts";
import getData from "../../actions/getData.ts";
import GetStudyInterface from "../../../shared/data/GetStudyInterface.ts";
import { Btn } from "../widgets/Btn.tsx";
import bindValueToInput from "../../actions/bindValueToInput.ts";
import {SetStudyColumnsPostInterface} from "../../../shared/data/SetStudyColumnsInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	function addColumn() {
		columns.push("");
		console.log(columns);
		m.redraw.sync();
		(document.getElementById("lastColumnText") as HTMLInputElement)?.focus();
	}
	function removeColumn(index: number) {
		columns.splice(index, 1);
		m.redraw();
	}
	
	const study = await getData<GetStudyInterface>("/getStudy", `?studyId=${query.get("id")}`);
	const columns: string[] = JSON.parse(study?.columns ?? "[]");
	
	return {
		history: [["Admin"]],
		view: () => <Form<SetStudyColumnsPostInterface> endpoint="/setStudyColumns" query={`?id=${study?.studyId}`} headers={{authorization: `Bearer ${study?.apiPassword}`}}>
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
							<Btn.Default iconKey="remove" onClick={() => removeColumn(index)}/>
						</div>
					</label>
				)
				: Lang.get("noColumnsInfo")
			}
			
			<Btn.PopoverBtn description="test" iconKey="add" onClick={addColumn}/>
		</Form>
	};
});