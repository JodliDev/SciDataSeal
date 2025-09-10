import m from "mithril";
import {PublicPage} from "../../PageComponent.ts";


export default PublicPage(async () => {
	return {
		history: [],
		view: () =>  <div>About</div>
	};
});