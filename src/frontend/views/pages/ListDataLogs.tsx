import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import {Lang} from "../../singleton/Lang.ts";
import ListEntries from "../widgets/ListEntries.tsx";
import css from "./ListDataLogs.module.css";
import getEntry from "../../actions/getEntry.ts";
import getBlockchainSignatureUrl from "../../../shared/actions/getBlockchainSignatureUrl.ts";
import Icon from "../widgets/Icon.tsx";
import floatingMenu, {tooltip} from "../../actions/floatingMenu.ts";
import {Btn} from "../widgets/Btn.tsx";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async query => {
	const questionnaireId = query.get("id") ?? "0";
	const questionnaire = await getEntry("questionnaire", parseInt(questionnaireId ?? "0"));
	const studyId = questionnaire?.studyId ?? 0;
	const study = await getEntry("study", studyId);
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("studies"), page: "ListStudies"},
			{label: study?.studyName ?? "Not found", page: "Study", query: `?id=${studyId}`},
			{label: Lang.get("questionnaires"), page: "ListQuestionnaires", query: `?studyId=${studyId}`},
			{label: questionnaire?.questionnaireName ?? "Not found", page: "Questionnaire", query: `?id=${questionnaireId}`},
			{label: Lang.get("showDataLogs"), page: "ListDataLogs", query: `?id=${questionnaireId}`},
		],
		view: () => <ListEntries
			query={{
				type: "dataLogs",
				questionnaireId: questionnaireId
			}}
			target="SetUser"
			direction="table"
			drawEntry={(entry) => {
				const signatures: string[] = JSON.parse(entry.signatures || "[]") ?? [];
				
				return <div class={`${css.line} ${entry.isHeader ? css.isHeader : ""}`} {...entry.isHeader ? tooltip(Lang.get("columns")) : {}}>
					<div class={css.cell}>
						{!entry.wasSent
							? <div {...tooltip(Lang.get("wasNotSent"))}><Icon iconKey="pending"/></div>
							: (
								!entry.wasConfirmed
									? <div {...tooltip(Lang.get("wasNotConfirmed"))}><Icon iconKey="wasNotConfirmed"/></div>
									: <Btn.Empty/>
							)
						}
					</div>
					<div class={`${css.cell} ${css.date}`}>{(new Date(entry.label)).toLocaleString()}</div>
					<div class={`${css.cell} ${css.url}`}>
						{signatures.length > 1
							? <div class="clickable" {...floatingMenu("url", () =>
								<div class="vertical">
									{signatures.map(signature =>
										<a href={getBlockchainSignatureUrl(entry.blockchainType, signature)} target="_blank">
											{getBlockchainSignatureUrl(entry.blockchainType, signature)}
										</a>
									)}
								</div>
							)}><Icon iconKey="openInNew"/></div>
							: (
								signatures.length == 1
									? <a href={getBlockchainSignatureUrl(entry.blockchainType, signatures[0])} target="_blank">
										<Icon iconKey="openInNew"/>
									</a>
									: ""
							)
						}
					</div>
				</div>
			}}
		/>
	};
});