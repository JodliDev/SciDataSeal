import m, {Child} from "mithril";
import css from "./FloatingMenu.module.css"
import {FixedComponent} from "../../mithril-polyfill.ts";

type FloatingMenuAccess = {
	close: () => void
	contains: (element: Element) => boolean
};
const openedMenus: Record<string, FloatingMenuAccess> = {}

interface Attributes {
	id: string;
	menu: (close: () => void) => Child;
	eventName?: "click" | "mouseenter" | "mousemove";
	connectedDropdowns?: string[];
	class?: string;
}

export default FixedComponent<Attributes>(vNode => {
	const {id, menu, eventName, connectedDropdowns} = vNode.attrs;
	let view: HTMLElement | null = null;
	
	function validatePosition(): void {
		if(!view)
			return;
		const rect = view.getBoundingClientRect();
		if(rect.left < 5) {
			view.style.left = "5px";
			view.style.transform = "none";
		}
		if(rect.right > window.innerWidth - 5) {
			view.style.left = "unset";
			view.style.right = "5px";
			view.style.transform = "none";
		}
		
		if(rect.top < 5) {
			view.style.top = "5px";
		}
		if(rect.bottom > window.innerHeight - 5) {
			view.style.top = "unset";
			view.style.bottom = "5px";
		}
	}
	
	function clickOutside(event: Event): void {
		const target = event.target as Element;
		if(view?.contains(target))
			return;
		if(connectedDropdowns) {
			for(const name of connectedDropdowns) {
				if(openedMenus[name]?.contains(target))
					return;
			}
		}
		
		closeDropdown();
		event.stopPropagation();
	}
	
	function closeDropdown() {
		delete openedMenus[id];
		document.removeEventListener("click", clickOutside);
		
		if(view?.parentElement != null)
			view.parentElement.removeChild(view);
		
		view = null;
	}
	
	function createDropdown(event: MouseEvent) {
		if(view)
			closeDropdown();
		view = document.createElement("div");
		
		const target = event.target as HTMLElement;
		
		const rect = target.getBoundingClientRect();
		
		switch(eventName) {
			default:
			case "click":
				view.style.left = `${rect.left + rect.width / 2}px`;
				view.style.top = `${rect.top + rect.height}px`;
				view.style.right = "unset";
				view.style.bottom = "unset";
				break;
			case "mouseenter":
				view.style.left = `${rect.left + rect.width / 2}px`;
				view.style.top = `${rect.top + rect.height}px`;
				view.style.right = "unset";
				view.style.bottom = "unset";
				break;
			case "mousemove":
				view.style.transform = "unset";
				view.style.pointerEvents = "none"
				break;
		}
		
		view.classList.add(css.FloatingMenu);
		view.classList.add(id);
		
		openedMenus[id] = {
			close: () => closeDropdown(),
			contains: otherView => view?.contains(otherView) ?? false
		};
		
		document.body.appendChild(view);
		
		m.mount(view, {
			onupdate(): void {
				validatePosition();
			},
			view: () => menu(() => closeDropdown())
		});
		
		//We have to wait until view has DOM positions so we can calculate based on that:
		window.setTimeout(validatePosition);
		
		//If a click event called this, it is not done bubbling. So we have to stall this listener, or it will be fired immediately
		window.setTimeout(() => document.addEventListener("click", clickOutside));
	}
	function getAttributes() {
		switch(eventName) {
			default:
			case "click":
				return {
					onclick: (event: MouseEvent) => {
						if(view)
							closeDropdown();
						else
							createDropdown(event);
					}
				};
			case "mouseenter":
				return {
					onmouseenter: (event: MouseEvent) => createDropdown(event),
					onmouseleave: () => closeDropdown()
				};
			case "mousemove":
				return {
					onmouseenter: (event: MouseEvent) => createDropdown(event),
					onmouseleave: () => closeDropdown(),
					onmousemove: (event: MouseEvent) => {
						if(!view)
							return;
						view.style.right = "unset";
						view.style.bottom = "unset";
						view.style.left = `${event.clientX + 10}px`;
						view.style.top = `${event.clientY}px`;
						validatePosition();
					}
				};
		}
	}
	
	return {
		view: () => {
			return <div class={vNode.attrs.class} {...getAttributes()}>{vNode.children}</div>
		}
	}
});

export function dropdownIsOpened(id: string): boolean {
	return openedMenus.hasOwnProperty(id);
}

export function closeDropdown(id: string): void {
	openedMenus[id]?.close();
	
}
