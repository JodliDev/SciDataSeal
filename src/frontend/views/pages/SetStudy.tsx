import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import {Lang} from "../../singleton/Lang.ts";
import Form from "../widgets/Form.tsx";
import {SiteTools} from "../../singleton/SiteTools.ts";
import {tooltip} from "../../actions/floatingMenu.ts";
import SetStudyInterface from "../../../shared/data/SetStudyInterface.ts";
import GenerateRandomString from "../../../shared/data/GenerateRandomString.ts";
import {bindPropertyToInput} from "../../actions/bindValueToInput.ts";
import listEntries from "../../actions/listEntries.ts";
import getEntry from "../../actions/getEntry.ts";
import GetEntryInterface from "../../../shared/data/GetEntryInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	async function onSent(response: SetStudyInterface["Response"]) {
		if(id != response.studyId) {
			SiteTools.switchPage("Study", `?id=${response.studyId}`);
		}
	}
	function onDeleted() {
		SiteTools.switchPage("ListStudies");
	}
	const id = parseInt(query.get("id") ?? "0");
	
	const study: Partial<GetEntryInterface<"study">["Response"]> = id
		? (await getEntry("study", id)) ?? {}
		: {};
	const blockchainAccounts = await listEntries("blockchainAccounts");
	
	let apiPassword = study?.apiPassword;
	
	if(!id) {
		apiPassword = (await getData<GenerateRandomString>("/generateRandomString"))?.generatedString;
	}
	
	return {
		history: id
			? [
				{label: Lang.get("home"), page: "Home"},
				{label: Lang.get("studies"), page: "ListStudies"},
				{label: study?.studyName ?? "Not found", page: "Study", query: `?id=${id}`},
				{label: Lang.get("changeSettings"), page: "SetStudy", query: `?id=${id}`},
			]
			: [
				{label: Lang.get("home"), page: "Home"},
				{label: Lang.get("studies"), page: "ListStudies"},
				{label: Lang.get("createStudy"), page: "SetStudy"},
			],
		view: () =>
			!!blockchainAccounts?.length
				? <Form<SetStudyInterface> id={id} endpoint="/setStudy" addDeleteBtnFor={id ? "study" : undefined} onSent={onSent} onDeleted={onDeleted}>
					<label>
						<small>{Lang.get("studyName")}</small>
						<input type="text" name="studyName" {...bindPropertyToInput(study, "studyName")}/>
					</label>
					<label {...tooltip(Lang.get("tooltipApiPassword"))}>
						<small>{Lang.get("apiPassword")}</small>
						<textarea name="apiPassword">{apiPassword ?? ""}</textarea>
					</label>
					<label>
						<small>{Lang.get("blockchainAccount")}</small>
						<select name="blockchainAccountId" {...bindPropertyToInput(study, "blockchainAccountId")}>
							{blockchainAccounts?.map(entry =>
								<option value={entry.id}>{entry.label}</option>
							)}
						</select>
					</label>
				</Form>
				: <div class="textCentered">{Lang.get("errorNoBlockchainAccounts")}</div>
		
	};
});