import m, {Vnode} from "mithril";
import {SiteTools} from "../SiteTools.ts";


export function A({attrs: {page, search, className, content}}: Vnode<{page: string, search?: `?${string}`, className?: string, content:() => Vnode}>) {
	const onClick = (event: MouseEvent) => {
		event.preventDefault();
		SiteTools.switchPage(page, search);
	}
	
	return {
		view: () => <a href={page} class={className} onclick={onClick}>{content()}</a>
	};
}
