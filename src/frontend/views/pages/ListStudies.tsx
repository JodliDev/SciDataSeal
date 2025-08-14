import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import {Lang} from "../../singleton/Lang.ts";
import ListEntries from "../widgets/ListEntries.tsx";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("studies"), page: "ListStudies"},
		],
		view: () => <ListEntries
			type="studies"
			addLabel={Lang.get("createStudy")}
			addTarget="EditStudy"
			target="Study"
		/>
	};
});