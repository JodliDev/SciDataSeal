import {PageComponent, PrivatePage} from "../../PageComponent.ts";
import m from "mithril";

export default async function Test(): PageComponent {
	
	return PrivatePage(
		() => <div>Test</div>
	);
}