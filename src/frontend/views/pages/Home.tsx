import {PageComponent, PublicPage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import postData from "../../actions/postData.ts";
import {A} from "../widgets/A.tsx";

export default async function Home(): PageComponent {
	
	async function load() {
		alert(await getData("/solana"));
	}
	async function save() {
		alert(JSON.stringify(
			await postData("/solana", {data: prompt()})
		));
	}
	
	
	return PublicPage(() =>
		<div>
			<div class="clickable" onclick={save}>Save</div>
			<div class="clickable" onclick={load}>Load</div>
			{m(A, {page: "Test", content: () => <div>sdf</div>})}
		</div>
	);
}