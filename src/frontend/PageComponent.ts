import {Children, Vnode} from "mithril";
import SessionData from "../shared/SessionData.ts";
import {FrontendOptions} from "../shared/FrontendOptions.ts";

export type PageData = Vnode<{session: SessionData, options: FrontendOptions}>;
export type LoadedPageComponent = (pageData: PageData) => {view: () => Children};
export type PageComponent = Promise<LoadedPageComponent>;