import m from "mithril";
import {SiteTools} from "../../singleton/SiteTools.ts";
import {FixedComponent} from "../../mithril-polyfill.ts";

interface Attributes {
	page: string,
	query?: `?${string}`,
	class?: string
}

/**
 * Mimics the behavior of <a> but prevents url calls and uses SiteTools.switchPage instead.
 */
export default FixedComponent<Attributes>(() => {
	const onClick = (page: string, query: `?${string}` | undefined, event: MouseEvent) => {
		event.preventDefault();
		SiteTools.switchPage(page, query);
	}
	
	return {
		view: (vNode) => {
			const {page, query} = vNode.attrs;
			return <a {...vNode.attrs} href={`${page}${query ?? ""}`} onclick={onClick.bind(null, page, query)} class={`horizontal vAlignCenter ${(vNode.attrs.class ?? "")}`}>
				{vNode.children}
			</a>
		}
	};
});
