import m from "mithril";
import LoginInterface from "../../../../shared/data/LoginInterface.ts";
import Form from "../../widgets/Form.tsx";
import {SiteTools} from "../../../singleton/SiteTools.ts";
import {Lang} from "../../../singleton/Lang.ts";
import {PageContent} from "../../../PageComponent.ts";

export default function Login(): PageContent {
	const onReceive = (response: LoginInterface["Response"]) => {
		SiteTools.session.userId = response.userId;
		SiteTools.session.isLoggedIn = true;
		SiteTools.switchPage("Home");
		m.redraw();
	}
	
	return {
		history: [],
		view: () =>  <div class="fillSpace horizontal hAlignCenter vAlignCenter">
			<Form<LoginInterface> endpoint="/login" onReceive={onReceive} submitLabel={Lang.get("login")}>
				<label>
					<small>{Lang.get("username")}</small>
					<input type="text" name="username"/>
				</label>
				<label>
					<small>{Lang.get("password")}</small>
					<input type="password" name="password"/>
				</label>
			</Form>
		</div>
	};
}