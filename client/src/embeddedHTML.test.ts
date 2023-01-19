import { getHTMLVirtualContent, getSymbolShortName, isValidHTMLMacro } from './embeddedHTML';

describe('isValidRustYew', () => {
	it('should be false without a html! macro', () => {
		expect(isValidHTMLMacro('fn main() {}')).toBe(false);
	});

	it('should be true for document with a html macro', () => {
		expect(isValidHTMLMacro('fn main() { html! {<div></div>}}')).toBe(true);
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