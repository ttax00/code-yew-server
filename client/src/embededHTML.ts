import { Position, Range } from 'vscode-languageclient';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { LanguageService, TokenType } from 'vscode-html-languageservice';

export function isInsideHTMLRegion(documentText: string, offset: number) {
	let match;
	const reHTML = /html! {/g;
	const htmlIndexes = [];
	while ((match = reHTML.exec(documentText)) != null) {
		htmlIndexes.push(match.index);
	}
	const reBrackets = /{/g;
	const bracketIndexes = [];
	while ((match = reBrackets.exec(documentText)) != null) {
		bracketIndexes.push(match.index);
	}

	console.debug(htmlIndexes);
	console.debug(bracketIndexes);
	console.debug(offset);
	return false;
}