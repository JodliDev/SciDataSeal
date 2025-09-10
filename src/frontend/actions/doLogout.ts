import {SiteTools} from "../singleton/SiteTools.ts";

export function doLogout(): void {
	SiteTools.session.userId = undefined;
	SiteTools.session.isLoggedIn = false;
	SiteTools.session.isAdmin = false;
	SiteTools.switchPage("About");
}