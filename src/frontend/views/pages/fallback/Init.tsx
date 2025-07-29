import m from "mithril";
import Form from "../../widgets/Form.tsx";
import InitializeInterface from "../../../../shared/data/InitializeInterface.ts";
import {Lang} from "../../../singleton/Lang.ts";
import {PageContent} from "../../../PageComponent.ts";

export default function Init(): PageContent {
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
	
	return {
		history: [],
		view: () => <div class="fillSpace vertical hAlignCenter vAlignCenter">
			<div>{Lang.get("initDescription")}</div>
			<Form<InitializeInterface> endpoint="/initialize" filterData={filterData} onReceive={onReceive}>
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
	};
}