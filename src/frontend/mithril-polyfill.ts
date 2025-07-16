import m, {Vnode} from "mithril";

/**
 * Support for <>bla</> (see jsxFragmentFactory in tsconfig.json
 * Thanks to https://kevinfiol.com/blog/mithriljs-esbuild-jsx/
 */
m.fragment = { view: (vNode: Vnode) => vNode.children } as any;


/**
 * Fix for https://github.com/MithrilJS/mithril.js/issues/2857
 */
export function FixedComponent<T>(create: m.ClosureComponent<T>) {
	return (attrs: T) => {
		const vNode = attrs as m.Vnode<T>;
		return create(vNode) as unknown as JSX.Element;
	}
}