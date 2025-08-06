/**
 * Interface representing the data related to a user session sent by the backend.
 */
export default interface SessionData {
	wasAuthenticated?: boolean;
	isLoggedIn?: boolean;
	isAdmin?: boolean;
	userId?: number;
}