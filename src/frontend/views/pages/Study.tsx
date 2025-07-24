import {PageComponent, PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import GetStudyInterface from "../../../shared/data/GetStudyInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import css from "./Study.module.css";
import A from "../widgets/A.tsx";

// noinspection JSUnusedGlobalSymbols
export default async function Study(query: URLSearchParams): PageComponent {
	const study = await getData<GetStudyInterface>("/getStudy", `?studyId=${query.get("id")}`);
	
	return PrivatePage(
		() => <div class={`${css.Study} horizontal wrapContent`}>
			{study
				? <>
					<A page="ManuallySaveData" query={`?id=${study.studyId}`} class="bigButton">{Lang.get("saveData")}</A>
					<A page="ManuallySetColumns" query={`?id=${study.studyId}`} class="bigButton">{Lang.get("setColumns")}</A>
					<A page="ViewStudyData" query={`?id=${study.studyId}`} class="bigButton">{Lang.get("viewData")}</A>
					<A page="ConnectAppHelp" query={`?id=${study.studyId}`} class="bigButton">{Lang.get("howToConnectMyApp")}</A>
				</>
				: <div class="selfAlignCenter">{Lang.get("notFound")}</div>
			}
		</div>
	);
}