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
	class?: string
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
		m.redraw();
	}
	callback.isReady = () => {
		return !isLoadingState && (!showIconState || successState);
	}
	
	return {
		view: () => isLoadingState
			? <LoadingSpinner {...vNode.attrs}/>
			: (showIconState
				? <div {...vNode.attrs} class={`${css.FeedbackIcon} ${successState ? css.success : css.failed} ${vNode.attrs.class ?? ""}`}>{
					m.trust(successState ? checkCircleFilledSvg : failSvg)
				}</div>
				: <div {...vNode.attrs} class={`${css.FeedbackIcon} ${css.hidden} ${reserveSpace ? css.reserveSpace : ""} ${vNode.attrs.class ?? ""}`}></div>)
	}
});
