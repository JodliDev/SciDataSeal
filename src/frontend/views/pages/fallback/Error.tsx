import m from "mithril";
import {PageContent} from "../../../PageComponent.ts";

export default function ErrorPage(): PageContent {
	return {
		history: [],
		view: () =>  <div>Error</div>
	};
}