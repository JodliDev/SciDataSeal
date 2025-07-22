import SessionData from "../../shared/SessionData.ts";

class SiteToolsClass {
	private _session?: SessionData;
	private _switchPage?: (_page: string, _query?: `?${string}`) => void
	
	public init(
		session: SessionData,
		switchPage: (_page: string, _query?: `?${string}`) => void
	) {
		this._session = session;
		this._switchPage = switchPage;
	}
	
	public get session() {
		return this._session!;
	}
	public get switchPage() {
		return this._switchPage!;
	}
}

export const SiteTools = new SiteToolsClass();