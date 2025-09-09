import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import {Lang} from "../../singleton/Lang.ts";
import Form from "../structures/Form.tsx";
import {SiteTools} from "../../singleton/SiteTools.ts";
import {tooltip} from "../../actions/floatingMenu.ts";
import SetStudyInterface from "../../../shared/data/SetStudyInterface.ts";
import GenerateRandomString from "../../../shared/data/GenerateRandomString.ts";
import {bindPropertyToInput} from "../../actions/bindValueToInput.ts";
import listEntries from "../../actions/listEntries.ts";
import getEntry from "../../actions/getEntry.ts";
import GetEntryInterface from "../../../shared/data/GetEntryInterface.ts";
import WarnIcon from "../structures/WarnIcon.tsx";

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
	const originalApiPassword = study?.apiPassword;
	const originalDataKey = study?.dataKey;
	const originalBlockchainAccount = study?.blockchainAccountId;
	
	if(!id) {
		const strings = (await getData<GenerateRandomString>("/generateRandomString", "?count=2"))?.generatedString;
		study.apiPassword = strings?.[0];
		study.dataKey = strings?.[1];
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
						<div class="inputLike horizontal vAlignCenter">
							<textarea name="apiPassword" {...bindPropertyToInput(study, "apiPassword")}/>
							{originalApiPassword != undefined && originalApiPassword != study.apiPassword &&
								<WarnIcon tooltip={Lang.get("warnChangingApiPassword")}/>
							}
						</div>
					</label>
					<label {...tooltip(Lang.get("tooltipDataKey"))}>
						<small>{Lang.get("dataKey")}</small>
						<div class="inputLike horizontal vAlignCenter">
							<textarea name="dataKey" {...bindPropertyToInput(study, "dataKey")}/>
							{originalDataKey != undefined && originalDataKey != study.dataKey &&
								<WarnIcon tooltip={Lang.get("warnChangingDataKey")}/>
							}
						</div>
					</label>
					<label>
						<small>{Lang.get("blockchainAccount")}</small>
						<div class="inputLike horizontal vAlignCenter">
							<select name="blockchainAccountId" {...bindPropertyToInput(study, "blockchainAccountId")}>
								{blockchainAccounts?.map(entry =>
									<option value={entry.id}>{entry.label}</option>
								)}
							</select>
							{originalBlockchainAccount != undefined && originalBlockchainAccount != study.blockchainAccountId &&
								<WarnIcon tooltip={Lang.get("warnChangingBlockchainAccount")}/>
							}
						</div>
					</label>
				</Form>
				: <div class="textCentered">{Lang.get("errorNoBlockchainAccounts")}</div>
		
	};
});