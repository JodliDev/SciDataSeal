import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import A from "../widgets/A.tsx";
import {Lang} from "../../singleton/Lang.ts";
import ListUserInterface from "../../../shared/data/ListUserInterface.ts";
import Icon from "../widgets/Icon.tsx";
import {tooltip} from "../../actions/FloatingMenu.tsx";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	const response = await getData<ListUserInterface>("/listUser");
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("listUser"), page: "ListUser"},
		],
		view: () => <div class="vertical vAlignCenter hAlignCenter wrapContent">
			{response?.user.map(user =>
				<A class="bigButton" page="EditUser" query={`?id=${user.userId}`}>{user.username}</A> )}
			
			<A page="EditUser" {...tooltip(Lang.get("tooltipCreateNewUser"))}><Icon iconKey="add"/></A>
		</div>
	};
});