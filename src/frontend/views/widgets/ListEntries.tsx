import m from "mithril";
import {TsClosureComponent} from "../../mithril-polyfill.ts";
import ListEntriesInterface, {ListDefinitions} from "../../../shared/data/ListEntriesInterface.ts";
import A from "./A.tsx";
import Icon from "./Icon.tsx";
import listEntries from "../../actions/listEntries.ts";
import {FeedbackCallBack} from "./FeedbackIcon.tsx";
import FeedbackContent from "./FeedbackContent.tsx";

interface Attributes {
	type: keyof ListDefinitions,
	addTarget: string,
	addLabel: string,
	addQuery?: `?${string}`,
	target: string,
	targetQuery?: `?${string}`,
	query?: `?${string}`,
}

export default TsClosureComponent<Attributes>((vNode) => {
	let currentType = vNode.attrs.type;
	let currentQuery = vNode.attrs.query;
	const feedback = new FeedbackCallBack();
	async function load() {
		feedback.setLoading(true);
		list = await listEntries(currentType, currentQuery) ?? [];
		feedback.setLoading(false);
		m.redraw();
	}
	let list: ListEntriesInterface<keyof ListDefinitions>["Response"]["list"] = [];
	load()
		.then();
	
	return {
		view: (vNode) => {
			const targetQuery = vNode.attrs.targetQuery;
			return <FeedbackContent callback={feedback}>
				<A page={vNode.attrs.addTarget} query={vNode.attrs.addQuery}>
					<Icon iconKey="add"/>
					{vNode.attrs.addLabel}
				</A>
				<br/>
				<div class="horizontal vAlignCenter hAlignCenter wrapContent selfAlignStretch">
					{list.map(entry =>
						<A class="bigButton" page={vNode.attrs.target} query={targetQuery ? `${targetQuery}&id=${entry.id}` : `?id=${entry.id}`}>{entry.label}</A> )}
				</div>
			</FeedbackContent>
		},
		onupdate: async (vNode) => {
			if(vNode.attrs.type != currentType || vNode.attrs.query != currentQuery) {
				currentType = vNode.attrs.type;
				currentQuery = vNode.attrs.query;
				await load();
			}
		}
	};
});
