import { DocumentSymbol, SymbolInformation } from 'vscode';



export function isValidHTMLMacro(documentText: string) {
	return !!documentText.match(/html! {.*}/gs);
}

export function isInsideHTMLRegion(documentText: string, offset: number) {
	if (!isValidHTMLMacro(documentText)) {
		return false;
	}

	const regions = getRegions(documentText);
	return regions.some((r) =>
	(
		r.languageId === 'html'
		&& r.start <= offset
		&& offset <= r.end
	));

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
			content = content.slice(0, r.start) + documentText.slice(r.start, r.end + 1) + content.slice(r.end + 1);
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

interface EmbeddedRegion {
	languageId: 'html' | 'rust';
	start: number;
	end: number;
}

export function getRegions(documentText: string) {
	// parsing valid `html! {` indexes. 
	const regions: EmbeddedRegion[] = [];
	const regex = /html! {/g;

	for (const match of documentText.matchAll(regex)) {
		// Start index of the char after `{`
		let start = match.index + 7;
		const action = {
			'{': 1,
			'}': - 1,
		};
		let level = 0;
		for (let i = start; i < documentText.length; i++) {
			const change = action[documentText.charAt(i)];
			if (change) {
				if (level == 0) {
					if (change == 1) {
						regions.push({
							languageId: 'html',
							start: start,
							end: i - 1,
						});
					} else if (change == -1) {
						regions.push({
							languageId: 'html',
							start: start,
							end: i - 1,
						});
						break;
					}
				} else if (level == 1 && change == -1) {
					start = i + 1;
				}
				level += change;
			}
		}
	}
	return regions;
}

export function flattenDocumentSymbols(symbols: DocumentSymbol[]): DocumentSymbol[] {
	return symbols.reduce((flat, symbol) => {
		return flat.concat([symbol])
			.concat(symbol.children ? flattenDocumentSymbols(symbol.children) : []);
	}, []);
}

export function getSymbolShortName(symbol: string): string {
	const match = symbol.match(/^.*?(?=\.)/);
	return match ? match[0] : '';
}