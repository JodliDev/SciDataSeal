import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import {Lang} from "../../singleton/Lang.ts";
import Form from "../widgets/Form.tsx";
import {SiteTools} from "../../singleton/SiteTools.ts";
import {tooltip} from "../../actions/FloatingMenu.ts";
import EditStudyInterface from "../../../shared/data/EditStudyInterface.ts";
import GetStudyInterface from "../../../shared/data/GetStudyInterface.ts";
import GenerateRandomString from "../../../shared/data/GenerateRandomString.ts";
import {bindPropertyToInput} from "../../actions/bindValueToInput.ts";
import listData from "../../actions/listData.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	async function onSent(response: EditStudyInterface["Response"]) {
		if(id != response.studyId) {
			SiteTools.switchPage("Study", `?id=${response.studyId}`);
		}
	}
	function onDeleted() {
		SiteTools.switchPage("ListStudies");
	}
	const id = parseInt(query.get("id") ?? "0");
	
	const study: Partial<GetStudyInterface["Response"]> = id
		? (await getData<GetStudyInterface>("/getStudy", `?studyId=${id}`)) ?? {}
		: {};
	const blockchainAccounts = await listData("blockchainAccounts");
	
	let apiPassword = study?.apiPassword;
	
	if(!id) {
		apiPassword = (await getData<GenerateRandomString>("/generateRandomString"))?.generatedString;
	}
	
	return {
		history: id
			? [
				{label: Lang.get("home"), page: "Home"},
				{label: Lang.get("studies"), page: "ListStudies"},
				{label: Lang.get("editStudy"), page: "EditStudy", query: `?id=${id}`},
			]
			: [
				{label: Lang.get("home"), page: "Home"},
				{label: Lang.get("createStudy"), page: "EditStudy", query: `?id=${id}`},
			],
		view: () =>
			!!blockchainAccounts?.length
				? <Form<EditStudyInterface> id={id} endpoint="/editStudy" addDeleteBtnFor={id ? "study" : undefined} onSent={onSent} onDeleted={onDeleted}>
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