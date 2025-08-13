import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import A from "../widgets/A.tsx";
import {Lang} from "../../singleton/Lang.ts";
import Icon from "../widgets/Icon.tsx";
import ListStudiesInterface from "../../../shared/data/ListStudiesInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	const response = await getData<ListStudiesInterface>("/listStudies");
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("studies"), page: "ListStudies"},
		],
		view: () => <div class="vertical hAlignCenter">
			<A page="EditStudy">
				<Icon iconKey="add"/>
				{Lang.get("createStudy")}
			</A>
			<br/>
			<div class="vertical vAlignCenter hAlignCenter wrapContent selfAlignStretch">
				{response?.studies.map(study =>
					<A class="bigButton" page="Study" query={`?id=${study.studyId}`}>{study.studyName}</A> )}
			</div>
		</div>
	};
});