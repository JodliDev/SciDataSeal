import m from "mithril";

/**
 * Fix for https://github.com/MithrilJS/mithril.js/issues/2857
 */
export function TsClosureComponent<T>(create: m.ClosureComponent<T>) {
	return create as unknown as (attrs: T & m.CommonAttributes<T, unknown>) => JSX.Element;
}