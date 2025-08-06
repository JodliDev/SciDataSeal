import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import {Lang} from "../../singleton/Lang.ts";
import Form from "../widgets/Form.tsx";
import UserSettingsInterface from "../../../shared/data/UserSettingsInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	const filterData = (data: Record<string, unknown>) => {
		if(!data.password && !data.passwordRepeat)
			return data as UserSettingsInterface["Request"];
		if(data.password !== data.passwordRepeat)
			throw new Error(Lang.get("passwordMismatch"));
		return {
			newPassword: data.password as string,
		}
	}
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("userSettings"), page: "UserSettings"},
		],
		view: () =>
			<Form<UserSettingsInterface> endpoint="/userSettings" filterData={filterData}>
				<label>
					<small>{Lang.get("password")}</small>
					<input type="password" name="password"/>
				</label>
				<label>
					<small>{Lang.get("passwordAgain")}</small>
					<input type="password" name="passwordRepeat"/>
				</label>
			</Form>
	};
});