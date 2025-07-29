import m from "mithril";
import {SiteTools} from "../../singleton/SiteTools.ts";
import {FixedComponent} from "../../mithril-polyfill.ts";

interface Attributes {
	page: string,
	query?: `?${string}`,
	class?: string
}

export default FixedComponent<Attributes>(vNode => {
	const {page, query} = vNode.attrs;
	const onClick = (event: MouseEvent) => {
		event.preventDefault();
		SiteTools.switchPage(page, query);
	}
	
	return {
		view: () => <a href={`${page}${query ?? ""}`} class={vNode.attrs.class} onclick={onClick}>{vNode.children}</a>
	};
});
