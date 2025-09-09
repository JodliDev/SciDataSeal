import m from "mithril";
import {TsClosureComponent} from "../../mithril-polyfill.ts";
import ListEntriesInterface, {ListDefinitions, ListResponseEntryType, ListResponseType} from "../../../shared/data/ListEntriesInterface.ts";
import A from "./A.tsx";
import Icon from "./Icon.tsx";
import {listEntriesWithPages} from "../../actions/listEntries.ts";
import {FeedbackCallBack} from "./FeedbackIcon.tsx";
import FeedbackContent from "./FeedbackContent.tsx";
import PageNumbers from "./PageNumbers.tsx";
import css from "./ListEntries.module.css";

interface Attributes<T extends keyof ListDefinitions> {
	query: ListEntriesInterface<T>["Query"];
	drawEntry: (entry: ListResponseEntryType<T>) => m.Child;
	direction: "horizontal" | "vertical" | "table";
	addTarget?: string;
	addLabel?: string;
	addQuery?: `?${string}`;
}

/**
 * Loads and shows a selectable list of entries for a provided type.
 */
function ListEntries<T extends keyof ListDefinitions>(vNode: m.Vnode<Attributes<T>>) {
	let currentQuery = vNode.attrs.query;
	const feedback = new FeedbackCallBack();
	async function load(page: number = 0) {
		feedback.setLoading(true);
		
		const queryValues: string[] = [];
		for(const key in currentQuery) {
			if(key === "type") {
				continue;
			}
			queryValues.push(`${key}=${currentQuery[key as keyof typeof currentQuery]}`);
		}
		const response = await listEntriesWithPages(vNode.attrs.query.type, page, queryValues.length ? `?${queryValues.join("&")}` : undefined);
		list = response?.list ?? [];
		
		feedback.setLoading(false);
		m.redraw();
		return response?.totalCount ?? 0;
	}
	let list: ListResponseType = [];
	
	return {
		view: (vNode: m.VnodeDOM<Attributes<T>>) => {
			return <div class="vertical vAlignCenter hAlignCenter fillSpace">
				{!!vNode.attrs.addLabel && !!vNode.attrs.addTarget &&
					<A page={vNode.attrs.addTarget} query={vNode.attrs.addQuery}>
						<Icon iconKey="add"/>
						{vNode.attrs.addLabel}
					</A>
				}
				
				<FeedbackContent callback={feedback} class="fillSpace selfAlignStretch">
					<div class={vNode.attrs.direction == "table" ? css.table : `${vNode.attrs.direction} vAlignCenter hAlignCenter wrapContent fullLine`}>
						{list.map(entry => vNode.attrs.drawEntry(entry))}
					</div>
				</FeedbackContent>
				
				<PageNumbers loadPage={load}/>
			</div>
		},
		onupdate: async (vNode: m.VnodeDOM<Attributes<T>>) => {
			if(JSON.stringify(vNode.attrs.query) != JSON.stringify(currentQuery)) {
				currentQuery = vNode.attrs.query;
				await load();
			}
		}
	};
}

export function buttonEntry(target: string, targetQuery?: `?${string}`) {
	return (entry: ListResponseEntryType) =>
		<A class="bigButton" page={target} query={targetQuery ? `${targetQuery}&id=${entry.id}` : `?id=${entry.id}`}>{entry.label}</A>;
}

export default TsClosureComponent(ListEntries);