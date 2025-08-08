import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import A from "../widgets/A.tsx";
import {Lang} from "../../singleton/Lang.ts";
import ListUsersInterface from "../../../shared/data/ListUsersInterface.ts";
import Icon from "../widgets/Icon.tsx";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	const response = await getData<ListUsersInterface>("/listUsers");
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("listUsers"), page: "ListUsers"},
		],
		view: () => <div class="vertical hAlignCenter">
			<A page="EditUser">
				<Icon iconKey="add"/>
				{Lang.get("createUser")}
			</A>
			<br/>
			<div class="vertical vAlignCenter hAlignCenter wrapContent selfAlignStretch">
				{response?.users.map(user =>
					<A class="bigButton" page="EditUser" query={`?id=${user.userId}`}>{user.username}</A> )}
			</div>
		</div>
	};
});