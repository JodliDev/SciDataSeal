import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import {Lang} from "../../singleton/Lang.ts";
import ListEntries, {buttonEntry} from "../structures/ListEntries.tsx";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("listUsers"), page: "ListUsers"},
		],
		view: () => <ListEntries
			query={{type: "users"}}
			drawEntry={buttonEntry("SetUser")}
			direction="horizontal"
			addLabel={Lang.get("createUser")}
			addTarget="SetUser"
		/>
	};
});