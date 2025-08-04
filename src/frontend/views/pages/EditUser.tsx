import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import {Lang} from "../../singleton/Lang.ts";
import {SiteTools} from "../../singleton/SiteTools.ts";
import Form from "../widgets/Form.tsx";
import EditUserInterface from "../../../shared/data/EditUserInterface.ts";
import GetUserInterface from "../../../shared/data/GetUserInterface.ts";
import {bindPropertyToInput} from "../../actions/bindValueToInput.ts";
import {tooltip} from "../../actions/FloatingMenu.tsx";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	async function onSent(response: EditUserInterface["Response"]): Promise<void> {
		if(!id)
			SiteTools.switchPage("EditUser", `?id=${response.userId}`);
	}
	function onDeleted() {
		SiteTools.switchPage("ListUser");
	}
	const filterData = (data: Record<string, unknown>) => {
		if(!data.password && !data.passwordRepeat)
			return data as EditUserInterface["Request"];
		if(data.password !== data.passwordRepeat)
			throw new Error(Lang.get("passwordMismatch"));
		return {
			userId: data.userId as number,
			username: data.username as string,
			password: data.password as string,
			isAdmin: data.isAdmin as boolean
		}
	}
	
	let showPasswordField = false;
	const id = parseInt(query.get("id") ?? "0");
	const user: Partial<GetUserInterface["Response"]> = id
		? await getData<GetUserInterface>("/getUser", `?userId=${id}`) ?? {}
		: {};
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("listUser"), page: "ListUser"},
			id
				? {label: user.username ?? "Not found", page: "EditUser", query: `?id=${id}`}
				: {label: Lang.get("createUser"), page: "EditUser"},
		],
		view: () =>
			<Form<EditUserInterface> id={id} endpoint="/editUser" deleteEndPoint="/deleteUser" filterData={filterData} onSent={onSent} onDeleted={onDeleted}>
				<label {...tooltip(Lang.get("tooltipAdminUser"))}>
					<small>{Lang.get("admin")}</small>
					<input type="checkbox" name="isAdmin" {...bindPropertyToInput(user, "isAdmin")}/>
				</label>
				<label>
					<small>{Lang.get("username")}</small>
					<input type="text" name="username" {...bindPropertyToInput(user, "username")}/>
				</label>
				{!!id &&
					<label>
						<div class="horizontal vAlignCenter">
							<input type="checkbox" onchange={() => {
								showPasswordField = !showPasswordField;
								m.redraw();
							}}/>
							<small>{Lang.get("changePassword")}</small>
						</div>
					</label>
				}
				{(!id || showPasswordField) &&
					<>
						<label>
							<small>{Lang.get("password")}</small>
							<input type="password" name="password"/>
						</label>
						<label>
							<small>{Lang.get("passwordAgain")}</small>
							<input type="password" name="passwordRepeat"/>
						</label>
					</>
				}
			</Form>
	};
});