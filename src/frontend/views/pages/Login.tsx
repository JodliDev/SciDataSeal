import {PageComponent, PublicPage} from "../../PageComponent.ts";
import m from "mithril";
import LoginData from "../../../shared/data/LoginData.ts";
import Form from "../widgets/Form.tsx";
import {SiteTools} from "../../singleton/SiteTools.ts";

export default async function Login(): PageComponent {
	const onReceive = (response: LoginData["Response"]) => {
		SiteTools.session.userId = response.userId;
		m.redraw();
	}
	
	return PublicPage(() =>
		<div class="fillSpace horizontal hAlignCenter vAlignCenter">
			<Form<LoginData> endpoint="/login" onReceive={onReceive}>
				<label>
					<small>Username:</small>
					<input type="text" name="username"/>
				</label>
				<label>
					<small>Password:</small>
					<input type="password" name="password"/>
				</label>
			</Form>
		</div>
	);
}