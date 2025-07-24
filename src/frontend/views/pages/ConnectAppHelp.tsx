import {PageComponent, PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import GetStudyInterface from "../../../shared/data/GetStudyInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import {Endpoints} from "../../../shared/definitions/Endpoints.ts";
import css from "./Study.module.css";

// noinspection JSUnusedGlobalSymbols
export default async function ConnectAppHelp(query: URLSearchParams): PageComponent {
	const study = await getData<GetStudyInterface>("/getStudy", `?studyId=${query.get("id")}`);
	
	const url = window.location.origin + "/api" + ("/saveData" satisfies Endpoints);
	return PrivatePage(
		() => <div class={`${css.Study} vertical`}>
			{study
				? <>
					<h2 class="selfAlignCenter">{study.studyName}</h2>
					{Lang.getWithColon("connectStudyDescription")}
					<h3>GET</h3>
					<div class="labelLike">
						<small>{Lang.get("url")}</small>
						<pre class="inputLike">{`${url}?id=${study.studyId}&pass=${study.apiPassword}&data=`}</pre>
					</div>
					<h3>POST</h3>
					<div class="labelLike">
						<small>{Lang.get("url")}</small>
						<pre class="inputLike">{url}</pre>
					</div>
					<div class="labelLike">
						<small>{Lang.get("body")}</small>
						<pre class="inputLike">{`id=${study.studyId}&pass=${study.apiPassword}&data=`}</pre>
					</div>
				</>
				: <div class="selfAlignCenter">{Lang.get("notFound")}</div>
			}
		</div>
	);
}