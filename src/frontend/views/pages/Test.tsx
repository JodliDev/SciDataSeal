import {PageComponent} from "../../PageComponent.ts";
import m from "mithril";

export default async function Test(): PageComponent {
	
	return () => {
		
		return {
			view: () => <div>Test</div>
		};
	};
}