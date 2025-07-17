import {PageComponent, PublicPage} from "../../PageComponent.ts";
import m from "mithril";
import Form from "../widgets/Form.tsx";
import Initialize from "../../../shared/data/Initialize.ts";
import {Lang} from "../../singleton/Lang.ts";

export default async function Init(): PageComponent {
	const filterData = (data: Record<string, unknown>) => {
		if(data.password !== data.passwordRepeat)
			throw new Error(Lang.get("passwordMismatch"));
		return {
			username: data.username as string,
			password: data.password as string,
		}
	}
	const onReceive = () => {
		window.location.reload();
	}
	
	return PublicPage(() =>
		<div class="fillSpace vertical hAlignCenter vAlignCenter">
			<div>{Lang.get("initDescription")}</div>
			<Form<Initialize> endpoint="/initialize" filterData={filterData} onReceive={onReceive}>
				<label>
					<small>{Lang.get("username")}</small>
					<input type="text" name="username"/>
				</label>
				<label>
					<small>{Lang.get("password")}</small>
					<input type="password" name="password"/>
				</label>
				<label>
					<small>{Lang.get("passwordAgain")}</small>
					<input type="password" name="passwordRepeat"/>
				</label>
			</Form>
		</div>
	);
}