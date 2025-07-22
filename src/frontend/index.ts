import m from "mithril";
import {Lang} from "./singleton/Lang.ts";
import Site from "./views/Site.tsx";
import {FrontendOptions} from "../shared/FrontendOptions.ts";
import LangSource from "../shared/LangSource.ts";
import SessionData from "../shared/SessionData.ts";
import "./mithril-polyfill.ts";

const langObj = JSON.parse(document.getElementById("langJson")!.innerHTML) as LangSource;
const options = JSON.parse(document.getElementById("optionsJson")!.innerHTML) as FrontendOptions;
const session = JSON.parse(document.getElementById("sessionJson")!.innerHTML) as SessionData;

Lang.init(langObj);
const homepage = window.location.pathname.substring(options.urlPath.length);
const search = window.location.search;
m.mount(document.getElementById("site")!, {view: () => m(Site, {session: session, options: options, homepageName: homepage, homeQuery: search})});
