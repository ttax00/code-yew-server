import { Position, Range } from 'vscode-languageclient';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { LanguageService, TokenType } from 'vscode-html-languageservice';


export function isInsideHTMLRegion(documentText: string, offset: number) {
	return false;
}