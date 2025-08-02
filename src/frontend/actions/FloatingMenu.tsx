import m, {Child} from "mithril";
import css from "./FloatingMenu.module.css"

interface Options {
	eventName?: "click" | "mouseenter" | "mousemove";
	connectedMenus?: string[];
}
interface OutputEvents {
	onclick?: (e: MouseEvent) => void;
	onmouseenter?: (e: MouseEvent) => void;
	onmouseleave?: (e: MouseEvent) => void;
	onmousemove?: (e: MouseEvent) => void;
}

class FloatingMenu {
	public static readonly openedMenus: Record<string, FloatingMenu> = {};
	
	private readonly id: string;
	private readonly menu: (close: () => void) => Child;
	private readonly options?: Options;
	private view: HTMLElement | null = null;
	
	constructor(id: string, menu: (close: () => void) => Child, options?: Options) {
		this.id = id;
		this.menu = menu;
		this.options = options;
	}
	
	private validatePosition(): void {
		if(!this.view)
			return;
		const rect = this.view.getBoundingClientRect();
		if(rect.left < 5) {
			this.view.style.left = "5px";
			this.view.style.transform = "none";
		}
		if(rect.right > window.innerWidth - 5) {
			this.view.style.left = "unset";
			this.view.style.right = "5px";
			this.view.style.transform = "none";
		}
		
		if(rect.top < 5) {
			this.view.style.top = "5px";
		}
		if(rect.bottom > window.innerHeight - 5) {
			this.view.style.top = "unset";
			this.view.style.bottom = "5px";
		}
	}
	
	/**
	 * Event listener that closes the menu when the page is clicked.
	 * Aborts when the menu or a connected menu was clicked
	 * Defined as lambda to preserve [this] when called by event listeners
	 * (and also having the same signature for removeEventListener)
	 */
	private clickOutside = (event: Event) => {
		const target = event.target as Element;
		if(this.view?.contains(target))
			return;
		if(this.options?.connectedMenus) {
			for(const name of this.options.connectedMenus) {
				if(FloatingMenu.openedMenus[name]?.contains(target))
					return;
			}
		}
		
		this.closeMenu();
		event.stopPropagation();
	}
	private createDropdown(event: MouseEvent): void {
		if(this.view)
			this.closeMenu();
		this.view = document.createElement("div");
		
		const target = event.target as HTMLElement;
		
		const rect = target.getBoundingClientRect();
		
		switch(this.options?.eventName) {
			default:
			case "click":
				this.view.style.left = `${rect.left + rect.width / 2}px`;
				this.view.style.top = `${rect.top + rect.height}px`;
				this.view.style.right = "unset";
				this.view.style.bottom = "unset";
				break;
			case "mouseenter":
				this.view.style.left = `${rect.left + rect.width / 2}px`;
				this.view.style.top = `${rect.top + rect.height}px`;
				this.view.style.right = "unset";
				this.view.style.bottom = "unset";
				break;
			case "mousemove":
				this.view.style.transform = "unset";
				this.view.style.pointerEvents = "none"
				break;
		}
		
		this.view.classList.add(css.FloatingMenu);
		
		FloatingMenu.openedMenus[this.id] = this;
		
		document.body.appendChild(this.view);
		
		m.mount(this.view, {
			onupdate: () => this.validatePosition(),
			view: () => this.menu(this.closeMenu.bind(this))
		});
		
		//We have to wait until view has DOM positions so we can calculate based on that:
		window.setTimeout(this.validatePosition.bind(this));
		
		//If a click event called this, it is not done bubbling. So we have to stall this listener, or it will be fired immediately
		window.setTimeout(() => document.addEventListener("click", this.clickOutside));
	}
	
	
	public closeMenu(): void {
		delete FloatingMenu.openedMenus[this.id];
		document.removeEventListener("click", this.clickOutside);
		
		if(this.view?.parentElement != null)
			this.view.parentElement.removeChild(this.view);
		
		this.view = null;
	}
	public getAttributes(): OutputEvents {
		switch(this.options?.eventName) {
			default:
			case "click":
				return {
					onclick: (event: MouseEvent) => {
						if(this.view)
							this.closeMenu();
						else
							this.createDropdown(event);
					}
				};
			case "mouseenter":
				return {
					onmouseenter: (event: MouseEvent) => this.createDropdown(event),
					onmouseleave: () => this.closeMenu()
				};
			case "mousemove":
				return {
					onmouseenter: (event: MouseEvent) => this.createDropdown(event),
					onmouseleave: () => this.closeMenu(),
					onmousemove: (event: MouseEvent) => {
						if(!this.view)
							return;
						this.view.style.right = "unset";
						this.view.style.bottom = "unset";
						this.view.style.left = `${event.clientX + 10}px`;
						this.view.style.top = `${event.clientY}px`;
						this.validatePosition();
					}
				};
		}
	}
	public contains(otherView: Element): boolean {
		return this.view?.contains(otherView) ?? false;
	}
}

export default function floatingMenu(id: string, menu: (close: () => void) => Child, options: Options = {}): OutputEvents {
	const floatingMenu = FloatingMenu.openedMenus.hasOwnProperty(id)
		? FloatingMenu.openedMenus[id]
		: new FloatingMenu(id, menu, options);
	
	return floatingMenu.getAttributes();
}

export function tooltip(description: string) {
	return floatingMenu(description, () => description, {eventName: "mousemove"});
}
