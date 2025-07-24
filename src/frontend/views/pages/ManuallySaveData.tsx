import {PageComponent, PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import Form from "../widgets/Form.tsx";
import {Lang} from "../../singleton/Lang.ts";
import getData from "../../actions/getData.ts";
import GetStudyInterface from "../../../shared/data/GetStudyInterface.ts";
import bindValueToInput from "../../actions/bindValueToInput.ts";
import {SetStudyColumnsPostInterface} from "../../../shared/data/SetStudyColumnsInterface.ts";
import css from "./ManuallySaveData.module.css";

// noinspection JSUnusedGlobalSymbols
export default async function ManuallySetColumns(query: URLSearchParams): PageComponent {
	const study = await getData<GetStudyInterface>("/getStudy", `?studyId=${query.get("id")}`);
	const columns: string[] = JSON.parse(study?.columns ?? "[]");
	const data: Record<string, string> = {};
	
	return PrivatePage(
		() => <Form<SetStudyColumnsPostInterface> endpoint="/saveData" query={`?id=${study?.studyId}`} headers={{authorization: `Bearer ${study?.apiPassword}`}}>
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
	);
}