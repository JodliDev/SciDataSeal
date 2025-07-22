import m from "mithril";
import LoginInterface from "../../../../shared/data/LoginInterface.ts";
import Form from "../../widgets/Form.tsx";
import {SiteTools} from "../../../singleton/SiteTools.ts";
import {Lang} from "../../../singleton/Lang.ts";

export default function Login() {
	const onReceive = (response: LoginInterface["Response"]) => {
		SiteTools.session.userId = response.userId;
		SiteTools.session.isLoggedIn = true;
		SiteTools.switchPage("Admin");
		m.redraw();
	}
	
	return {
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