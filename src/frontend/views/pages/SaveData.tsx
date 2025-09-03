import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import Form from "../widgets/Form.tsx";
import {Lang} from "../../singleton/Lang.ts";
import {SaveDataInterface} from "../../../shared/data/SaveDataInterface.ts";
import getEntry from "../../actions/getEntry.ts";
import CanceledByUserException from "../../../shared/exceptions/CanceledByUserException.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	function confirmSend() {
		if(!confirm(Lang.get("confirmSavingData"))) {
			throw new CanceledByUserException();
		}
	}
	const id = query.get("id");
	const questionnaire = await getEntry("questionnaire", parseInt(id ?? "0"));
	const studyId = questionnaire?.studyId ?? parseInt(query.get("studyId") ?? "0");
	const study = await getEntry("study", studyId);
	const columns: string[] = JSON.parse(questionnaire?.columns || "[]");
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("studies"), page: "ListStudies"},
			{label: study?.studyName ?? "Not found", page: "Study", query: `?id=${studyId}`},
			{label: Lang.get("questionnaires"), page: "ListQuestionnaires", query: `?studyId=${studyId}`},
			{label: questionnaire?.questionnaireName ?? "Not found", page: "Questionnaire", query: `?id=${id}`},
			{label: Lang.get("saveData"), page: "SaveData", query: `?id=${id}`},
		],
		view: () => !!columns.length
			? <Form<SaveDataInterface>
				endpoint="/saveData"
				query={`?id=${questionnaire?.questionnaireId}`}
				headers={{authorization: `Bearer ${questionnaire?.apiPassword}`}}
				onBeforeSend={confirmSend}
				clearFormWhenDone={true}
			>
				<div class="horizontal hAlignCenter wrapContent">
					{columns.map(column =>
						<label>
							<small>{column}</small>
							<textarea placeholder={Lang.get("columnData")} name={column}></textarea>
						</label>
					)}
				</div>
			</Form>
			: <div class="warn textCentered">{Lang.get("warnNoColumns")}</div>
	};
});