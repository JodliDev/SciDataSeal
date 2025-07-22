import {PageComponent, PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import ListStudiesInterface from "../../../shared/data/ListStudiesInterface.ts";
import A from "../widgets/A.tsx";

// noinspection JSUnusedGlobalSymbols
export default async function ListStudies(): PageComponent {
	const response = await getData<ListStudiesInterface>("/listStudies");
	
	return PrivatePage(
		() => <div class="vertical wrapContent">
			{response?.studies.map(study => <A class="bigButton" page="Study" query={`?id=${study.studyId}`}>{study.studyName}</A> )}
		</div>
	);
}