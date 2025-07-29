import m from "mithril";
import {PageContent} from "../../../PageComponent.ts";

export default function Home(): PageContent {
	return {
		history: [],
		view: () =>  <div>Home</div>
	};
}