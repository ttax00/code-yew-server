

interface EmbeddedRegion {
	languageId: string | undefined;
	start: number;
	end: number;
	attributeValue?: boolean;
}

export function isInsideHTMLRegion(documentText: string, offset: number) {
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