import User from "./tables/User.ts";
import Session from "./tables/Session.ts";

export default interface DatabaseInstructions {
	User: User
	Session: Session
}