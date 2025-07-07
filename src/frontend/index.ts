import m from "mithril";
import {Lang} from "./Lang.ts";
import Site from "./views/Site.tsx";
import {FrontendOptions} from "../shared/FrontendOptions.ts";
import LangSource from "../shared/LangSource.ts";

const langObj = JSON.parse(document.getElementById("langJson")!.innerHTML) as LangSource;
const options = JSON.parse(document.getElementById("optionsJson")!.innerHTML) as FrontendOptions;
Lang.init(langObj);
const homepage = window.location.pathname.substring(options.urlPath.length + 1);
m.mount(document.getElementById("site")!, {view: () => m(Site, {options: options, homepageName: homepage})});
