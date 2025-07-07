import m from "mithril";
import {LoadingSpinner} from "./widgets/LoadingSpinner.tsx";

export default function LoadingPage() {
	return {
		view: () =>  m(LoadingSpinner)
	};
}