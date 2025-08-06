/**
 * Represents the options for the frontend which were transmitted by the backend.
 * @see src/backend/Options
 * @see src/backend/actions/recreateOptionsString
 */
export interface FrontendOptions {
	isInit: boolean;
	urlPath: string;
}
