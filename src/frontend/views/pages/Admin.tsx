import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import {Lang} from "../../singleton/Lang.ts";
import A from "../widgets/A.tsx";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	return {
		history: [["Admin"]],
		view: () => <div class="horizontal vAlignCenter hAlignCenter wrapContent">
			<A page="CreateStudy" class="bigButton">{Lang.get("createStudy")}</A>
			<A page="ListStudies" class="bigButton">{Lang.get("listStudies")}</A>
		</div>
	};
});