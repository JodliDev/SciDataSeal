import SessionData from "../../shared/SessionData.ts";

/**
 * Used to access certain features from anywhere in the frontend.
 * Its {@link init()} is called in `Site`
 *
 * @see src/frontend/views/Site.tsx
 */
class SiteToolsClass {
	private _session?: SessionData;
	private _switchPage?: (_page: string, _query?: `?${string}`) => void
	
	/**
	 * Initializes the instance with session data and a page switching callback.
	 *
	 * @param session - The session data to be used for the instance.
	 * @param switchPage - A function to switch between pages, accepting the page name and an optional query string.
	 */
	public init(
		session: SessionData,
		switchPage: (_page: string, _query?: `?${string}`) => void
	): void {
		this._session = session;
		this._switchPage = switchPage;
	}
	
	/**
	 * Retrieves the current session data.
	 */
	public get session(): SessionData {
		return this._session!;
	}
	
	/**
	 * Calls the current `switchPage` callback.
	 * This method provides access to the functionality responsible for managing page transitions.
	 */
	public get switchPage() {
		return this._switchPage!;
	}
}

/**
 * A singleton that is used to access certain features from anywhere in the frontend.
 * Its {@link init()} is called in `Site`
 *
 * @see SiteToolsClass
 * @see src/frontend/views/Site.tsx
 */
export const SiteTools = new SiteToolsClass();