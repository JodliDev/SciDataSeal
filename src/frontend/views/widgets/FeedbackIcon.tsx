import m from "mithril";
import checkCircleFilledSvg from "../../assets/icons/success.svg?raw";
import failSvg from "../../assets/icons/failed.svg?raw";
import {FixedComponent} from "../../mithril-polyfill.ts";
import LoadingSpinner from "./LoadingSpinner.tsx";
import css from "./FeedbackIcon.module.css";

export class FeedbackCallBack {
	setSuccess: (success: boolean) => void = () => {}
	setLoading: (isLoading: boolean) => void = () => {}
	isReady: () => boolean = () => true
}

interface FeedbackIconOptions {
	reserveSpace?: boolean
	callback: FeedbackCallBack
}

export default FixedComponent<FeedbackIconOptions>(vNode => {
	const {reserveSpace, callback} = vNode.attrs
	let isLoadingState = false;
	let showIconState = false;
	let successState = false;
	let timeoutId = 0;
	
	callback.setSuccess = (success: boolean) => {
		showIconState = true;
		successState = success;
		isLoadingState = false;
		m.redraw();
		
		window.clearTimeout(timeoutId);
		timeoutId = window.setTimeout(() => {
			showIconState = false;
			m.redraw();
		}, 2000);
	}
	callback.setLoading = (isLoading: boolean) => {
		isLoadingState = isLoading;
	}
	callback.isReady = () => {
		return !isLoadingState && (!showIconState || successState);
	}
	
	return {
		view: () => isLoadingState
			? <LoadingSpinner reserveSpace={true}/>
			: (showIconState
				? <div class={`${css.FeedbackIcon} ${successState ? css.success : css.failed}`}>{
					m.trust(successState ? checkCircleFilledSvg : failSvg)
				}</div>
				: <div class={`${css.FeedbackIcon} ${css.hidden} ${reserveSpace ? css.reserveSpace : ""}`}></div>)
	}
});
