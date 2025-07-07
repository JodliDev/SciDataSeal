import {Children, Vnode} from "mithril";

export type PageData = Vnode<{}>;
export type LoadedPageComponent = (pageData: PageData) => {view: () => Children};
export type PageComponent = Promise<LoadedPageComponent>;