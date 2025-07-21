import m from "mithril";
import LoadingSpinner from "../../widgets/LoadingSpinner.tsx";

export default function Loading() {
	return {
		view: () =>  <LoadingSpinner visible={true} />
	};
}