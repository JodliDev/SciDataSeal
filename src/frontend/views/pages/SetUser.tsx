import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import {Lang} from "../../singleton/Lang.ts";
import {SiteTools} from "../../singleton/SiteTools.ts";
import Form from "../structures/Form.tsx";
import SetUserInterface from "../../../shared/data/SetUserInterface.ts";
import {bindPropertyToInput} from "../../actions/bindValueToInput.ts";
import {tooltip} from "../../actions/floatingMenu.ts";
import getEntry from "../../actions/getEntry.ts";
import GetEntryInterface from "../../../shared/data/GetEntryInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	async function onSent(response: SetUserInterface["Response"]): Promise<void> {
		if(!id) {
			SiteTools.switchPage("SetUser", `?id=${response.userId}`);
		}
	}
	function onDeleted() {
		SiteTools.switchPage("ListUsers");
	}
	const filterData = (data: Record<string, unknown>) => {
		if(!data.password && !data.passwordRepeat)
			return {
				userId: data.id as number,
				username: data.username as string,
				isAdmin: data.isAdmin as boolean
			}
		if(data.password !== data.passwordRepeat) {
			throw new Error(Lang.get("errorPasswordMismatch"));
		}
		return {
			userId: data.id as number,
			username: data.username as string,
			password: data.password as string,
			isAdmin: data.isAdmin as boolean
		}
	}
	
	let showPasswordField = false;
	const id = parseInt(query.get("id") ?? "0");
	const user: Partial<GetEntryInterface<"user">["Response"]> = id
		? await getEntry("user", id) ?? {}
		: {};
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("listUsers"), page: "ListUsers"},
			id
				? {label: user.username ?? "Not found", page: "SetUser", query: `?id=${id}`}
				: {label: Lang.get("createUser"), page: "SetUser"},
		],
		view: () =>
			<Form<SetUserInterface> id={id} endpoint="/setUser" addDeleteBtnFor={id ? "user" : undefined} filterData={filterData} onSent={onSent} onDeleted={onDeleted}>
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
							<input class="enablePassword" type="checkbox" onchange={() => {
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