import m, {Child} from "mithril";
import css from "./floatingMenu.module.css"

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

interface MithrilEvent {
	redraw?: boolean;
}

/**
 * Represents a floating menu that can be dynamically displayed and interacted with on the page.
 * This class manages the opening, closing, and positioning of the menu element, as well as
 * responding to various user interactions.
 */
class FloatingMenuClass {
	public static readonly openedMenus: Record<string, FloatingMenuClass> = {};
	
	private readonly id: string;
	private readonly menu: (close: () => void) => Child;
	private readonly options?: Options;
	private view: HTMLElement | null = null;
	
	constructor(id: string, menu: (close: () => void) => Child, options?: Options) {
		this.id = id;
		this.menu = menu;
		this.options = options;
	}
	
	/**
	 * Validates and adjusts the position of the view element to ensure that it remains within
	 * the visible boundaries of the viewport, including adding spacing when necessary.
	 */
	private validatePosition(): void {
		if(!this.view) {
			return;
		}
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
		if(this.view?.contains(target)) {
			return;
		}
		if(this.options?.connectedMenus) {
			for(const name of this.options.connectedMenus) {
				if(FloatingMenuClass.openedMenus[name]?.contains(target)) {
					return;
				}
			}
		}
		
		this.closeMenu();
		event.stopPropagation();
	}
	
	/**
	 * Creates and displays a dropdown menu at the appropriate position based on the provided event's target element.
	 * Initializes the dropdown's view element, calculates its position on the screen, and mounts the menu.
	 * Adds event listeners for handling interactions such as closing the dropdown when clicking outside.
	 *
	 * @param event - The mouse event that triggers the creation of the dropdown. Used to determine the dropdown's position on the screen.
	 */
	private createDropdown(event: MouseEvent): void {
		if(this.view) {
			this.closeMenu();
		}
		this.view = document.createElement("div");
		this.view.classList.add(css.openedMenu);
		
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
		
		FloatingMenuClass.openedMenus[this.id] = this;
		
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
	
	
	/**
	 * Closes the currently opened menu by performing the following actions:
	 * - Removes the menu's reference from the list of opened menus.
	 * - Detaches the associated event listener for clicks outside the menu.
	 * - Removes the menu's view element from its parent in the DOM if it exists.
	 * - Clears the reference to the menu's view.
	 */
	public closeMenu(): void {
		delete FloatingMenuClass.openedMenus[this.id];
		document.removeEventListener("click", this.clickOutside);
		
		if(this.view?.parentElement != null) {
			this.view.parentElement.removeChild(this.view);
		}
		
		this.view = null;
	}
	
	/**
	 * Returns event attributes corresponding to the configured event name.
	 *
	 * @return An object containing event handler functions for the specified event type.
	 */
	public getAttributes(): OutputEvents {
		switch(this.options?.eventName) {
			default:
			case "click":
				return {
					onclick: (event: MouseEvent) => {
						(event as MithrilEvent).redraw = false;
						if(this.view) {
							this.closeMenu();
						}
						else {
							this.createDropdown(event);
						}
					}
				};
			case "mouseenter":
				return {
					onmouseenter: (event: MouseEvent) => {
						(event as MithrilEvent).redraw = false;
						this.createDropdown(event);
					},
					onmouseleave: (event: MouseEvent) => {
						(event as MithrilEvent).redraw = false;
						this.closeMenu();
					}
				};
			case "mousemove":
				return {
					onmouseenter: (event: MouseEvent) => {
						(event as MithrilEvent).redraw = false;
						this.createDropdown(event);
						if(!this.view) {
							return;
						}
						this.view.style.left = `${event.clientX + 10}px`;
						this.view.style.top = `${event.clientY + 10}px`;
					},
					onmouseleave: (event: MouseEvent) => {
						(event as MithrilEvent).redraw = false;
						this.closeMenu();
					},
					onmousemove: (event: MouseEvent) => {
						(event as MithrilEvent).redraw = false;
						if(!this.view) {
							return;
						}
						this.view.style.right = "unset";
						this.view.style.bottom = "unset";
						this.view.style.left = `${event.clientX + 10}px`;
						this.view.style.top = `${event.clientY + 10}px`;
						this.validatePosition();
					}
				};
		}
	}
	
	/**
	 * Checks if the current view contains the specified element.
	 *
	 * @param otherView - The element to check for containment within the current view.
	 * @return Returns true if the specified element is contained within the current view, otherwise false.
	 */
	public contains(otherView: Element): boolean {
		return this.view?.contains(otherView) ?? false;
	}
}

/**
 * Creates a floating menu that will be place on above all elements below the element `floatingMenu` is used on.
 *
 * Usage example:
 * ```
 * <div {...floatingMenu("menu", () => <div>Menu content</div>)}>Button</div>
 * ```
 *
 * @param id - A unique identifier for the floating menu. The id is used only when the menu is opened.
 * @param menu - A callback function to render the menu. The argument `close` can be used to close the menu prematurely.
 * @param options - An optional configuration object for the floating menu.
 */
export default function floatingMenu(id: string, menu: (close: () => void) => Child, options: Options = {}): OutputEvents {
	const floatingMenu = FloatingMenuClass.openedMenus.hasOwnProperty(id)
		? FloatingMenuClass.openedMenus[id]
		: new FloatingMenuClass(id, menu, options);
	
	return floatingMenu.getAttributes();
}

/**
 * Displays a tooltip with a given description.
 * @see floatingMenu
 *
 * @param description - The text to display in the tooltip.
 */
export function tooltip(description: string): OutputEvents {
	return floatingMenu("tooltip", () => description, {eventName: "mousemove"});
}

/**
 * Closes all menus that are currently opened.
 * Mostly useful for unit testing.
 */
export function closeAllMenus() {
	for(const key in FloatingMenuForTesting.openedMenus) {
		FloatingMenuForTesting.openedMenus[key].closeMenu();
	}
}

/**
 * Used for unit tests
 */
export class FloatingMenuForTesting extends FloatingMenuClass {} //used for unit testing