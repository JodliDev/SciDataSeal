import {PageComponent, PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import {Lang} from "../../singleton/Lang.ts";
import A from "../widgets/A.tsx";

// noinspection JSUnusedGlobalSymbols
export default async function Admin(): PageComponent {
	return PrivatePage(() =>
		<div class="horizontal wrapContent">
			<A page="CreateStudy" class="bigButton">{Lang.get("createStudy")}</A>
			<A page="ListStudies" class="bigButton">{Lang.get("listStudies")}</A>
		</div>
	);
}