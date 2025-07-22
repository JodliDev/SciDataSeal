import m from "mithril";
import {PageVnode} from "../../../PageComponent.ts";

export default function Home(vNode: PageVnode) {
	console.log(vNode);
	return {
		view: () =>  <div>Home</div>
	};
}