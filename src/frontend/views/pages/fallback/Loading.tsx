import m from "mithril";
import LoadingSpinner from "../../widgets/LoadingSpinner.tsx";

export default function Loading() {
	return {
		view: () =>  <div class="vertical hAlignCenter vAlignCenter fillSpace">
			<LoadingSpinner visible={true} />
		</div>
	};
}