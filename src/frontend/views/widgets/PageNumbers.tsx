import {TsClosureComponent} from "../../mithril-polyfill.ts";
import m from "mithril";
import {Btn} from "./Btn.tsx";
import css from "./PageNumbers.module.css";
import {PAGE_SIZE} from "../../../shared/definitions/Constants.ts";

interface Attributes {
	loadPage: (page: number) => Promise<number>
}

/**
 * Handles load response and creates a page menu with the appropriate to start, prev, next and / or to end buttons
 */
export default TsClosureComponent<Attributes>((vNode) => {
	async function onPageChange(page: number): Promise<void> {
		currentPage = page;
		totalCount = await vNode.attrs.loadPage(page);
		lastPage = Math.floor(totalCount / PAGE_SIZE);
	}
	function isNeeded() : boolean {
		return lastPage >= 1;
	}
	
	let currentPage = 0;
	let totalCount = 0;
	let lastPage = 0;
	
	onPageChange(0)
		.then();
	
	return {
		view: () => {
			return isNeeded()
				? <div class={`${css.PageNumbers} horizontal hAlignCenter vAlignCenter`}>
					{currentPage > 1
						? <Btn.Default iconKey="toStart" onclick={() => onPageChange(0)}/>
						: <Btn.Empty/>
					}
					{currentPage > 0
						? <Btn.Default iconKey="prev" onclick={() => onPageChange(currentPage - 1)}/>
						: <Btn.Empty/>
					}
					
					<span>{currentPage + 1}&nbsp;/&nbsp;{lastPage + 1}</span>
					
					{currentPage < lastPage
						? <Btn.Default iconKey="next" onclick={() => onPageChange(currentPage + 1)}/>
						: <Btn.Empty/>
					}
					{currentPage + 1 < lastPage
						? <Btn.Default iconKey="toEnd" onclick={() => onPageChange(lastPage)}/>
						: <Btn.Empty/>
					}
				</div>
				: "";
		}
	}
});