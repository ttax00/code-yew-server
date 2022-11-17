import { DocumentSymbol, SymbolInformation } from 'vscode';


interface EmbeddedRegion {
	languageId: string | undefined;
	start: number;
	end: number;
	attributeValue?: boolean;
}

export function isValidRustYew(documentText: string) {
	if (documentText.match(/html! {.*}/gs)) {
		// valid if there is at least one html! { ... } macro
		return true;
	} else {
		return false;
	}
}

export function isInsideHTMLRegion(documentText: string, offset: number) {
	// Don't parse on no html! macro documents
	if (!isValidRustYew(documentText)) {
		return false;
	}

	const regions = getRegions(documentText);
	let answer = false;
	regions.forEach((r) => {
		if (r.languageId === 'html') {
			if (r.start <= offset && offset <= r.end) {
				answer = true;
			}
		}
	});
	return answer;
}

export function getHTMLVirtualContent(documentText: string) {

	const regions = getRegions(documentText);

	let content = documentText
		.split('\n')
		.map(line => {
			return ' '.repeat(line.length);
		}).join('\n');

	regions.forEach(r => {
		if (r.languageId === 'html') {
			content = content.slice(0, r.start) + documentText.slice(r.start, r.end) + content.slice(r.end);
		}
	});

	content = content.replace(/<>/g, '  ');
	content = content.replace(/<\/>/g, '   ');
	content = content.replace(/<.*\/>/g, "");
	content = content.replace(/~/g, ' ');
	content = content.replace(/@/g, 'g');
	content = content.replace(/= /g, '  ');
	content = content.replace(/html! \(\)/g, '        ');

	return content;
}

export function getRegions(documentText: string) {
	// parsing valid html out!
	const regions: EmbeddedRegion[] = [];
	let match;
	const reHTML = /html! {/g;
	const macroStartIndexes = [];
	while ((match = reHTML.exec(documentText)) != null) {
		macroStartIndexes.push(match.index + 7);
	}

	macroStartIndexes.forEach((index) => {
		let start = index;
		let layer = 0;
		for (let i = index; i < documentText.length; i++) {
			let changed = false;
			switch (documentText.charAt(i)) {
				case '{':
					layer++;
					changed = true;
					break;
				case '}':
					layer--;
					changed = true;
					break;
			}

			if (changed) {
				changed = false;
				if (layer - 1 == 0) {
					regions.push({
						languageId: 'html',
						start: start,
						end: i,
					});
				} else if (layer < 0) {
					regions.push({
						languageId: 'html',
						start: start,
						end: i,
					});
					break;
				} else {
					start = i + 1;
				}
			}

		}
	});

	return regions;
}

export function unpackDocumentSymbolChildren(symbol: DocumentSymbol): DocumentSymbol[] {
	let result: DocumentSymbol[] = [];
	result.push(symbol);
	if (symbol.children.length > 0) {
		symbol.children.forEach(s => result = result.concat(unpackDocumentSymbolChildren(s)));
	}
	return result;
}

export function flattenDocumentSymbols(symbols: DocumentSymbol[]) {

	let flat: DocumentSymbol[] = [];
	symbols.forEach(s => flat = flat.concat(unpackDocumentSymbolChildren(s)));
	return flat;
}

export function getSymbolShortName(symbol: string): string {
	const match = symbol.match(/\w*[^.]/);
	if (match.length === 1) {
		return match[0];
	} else {
		throw Error(`symbol name might be wrong ${symbol}`);
		return '';
	}
}