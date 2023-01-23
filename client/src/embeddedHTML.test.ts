import { getHTMLVirtualContent, getSymbolShortName, isInsideHTMLRegion, isValidHTMLMacro } from './embeddedHTML';
// TODO: ADD jest *test.ts files to typescript compiler ignore
describe('isValidHTMLMacro', () => {
	it('should be false without a html! macro', () => {
		expect(isValidHTMLMacro('fn main() {}')).toBe(false);
	});

	it('should be true for document with a html macro', () => {
		expect(isValidHTMLMacro('fn main() { html! {<div></div>}}')).toBe(true);
	});
});

describe('isInsideHTMLRegion', () => {
	const test = `html! {<div>{"Hello World"}</div>}`;
	expect(test.length).toBe(34);
	expect(test.charAt(12)).toBe('{');

	function arr(from: number, to: number): number[] {
		return Array.from({ length: to - from + 1 }, (_, i) => i + from);
	}
	expect(arr(1, 5)).toStrictEqual([1, 2, 3, 4, 5]);

	it.each([
		...arr(7, 11), // <div>
		...arr(27, 32) // </div>
	])(`it should return true for pos: %p`, (i) => {
		expect(isInsideHTMLRegion(test, i)).toBe(true);
	});

	it.each([...arr(0, 6), 	// html! {
	...arr(12, 26),		   	// {"Hello World"}
		33					// }
	])(`it should return false for pos: %p`, (i) => {
		expect(isInsideHTMLRegion(test, i)).toBe(false);
	});
});
describe('getHTMLVirtualContent', () => {
	it('should replace rust code with empty spaces', () => {
		const res = getHTMLVirtualContent(`html! {\n<div>{"Hello World!"}</div>\n};`);
		expect(res).toBe(`       \n<div>                </div>\n  `);
	});
});

describe('getSymbolShortName', () => {
	it('should return the name before "." seperator', () => {
		expect(getSymbolShortName("hello.world")).toBe("hello");
		expect(getSymbolShortName("my-hame-is.world.beta.2")).toBe("my-hame-is");
	});

	it('should return empty string when errors', () => {
		expect(getSymbolShortName(".")).toBe("");
		expect(getSymbolShortName("")).toBe("");

	});
});