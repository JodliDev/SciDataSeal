import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import ListStudiesInterface from "../../../shared/data/ListStudiesInterface.ts";
import A from "../widgets/A.tsx";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	const response = await getData<ListStudiesInterface>("/listStudies");
	
	return {
		history: [["Admin"], ["ListStudies"]],
		view: () => <div class="horizontal vAlignCenter hAlignCenter wrapContent">
			{response?.studies.map(study => <A class="bigButton" page="Study" query={`?id=${study.studyId}`}>{study.studyName}</A> )}
		</div>
	};
});