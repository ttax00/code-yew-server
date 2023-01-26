import { commands, Uri, CompletionList, TextDocument, DocumentSymbol, Hover, WorkspaceEdit, Range, Position, TextEdit, CompletionItemKind } from 'vscode';

import {
	LanguageClientOptions
} from 'vscode-languageclient/node';
import { flattenDocumentSymbols, getHTMLVirtualContent, getSymbolShortName, isInsideHTMLRegion, isValidHTMLMacro } from './embeddedHTML';
import { virtualDocumentContents } from './extension';


function vdocUri(document: TextDocument) {
	const originalUri = document.uri.toString(true);
	const vdocUriString = `embedded://html/${encodeURIComponent(
		originalUri
	)}.html`;
	const vUri = Uri.parse(vdocUriString);
	virtualDocumentContents.set(vUri.toString(true), getHTMLVirtualContent(document.getText()));
	return vUri;
}

export const clientOptions: LanguageClientOptions = {
	documentSelector: [{ scheme: 'file', language: 'rust' }],
	middleware: {
		async provideCompletionItem(document, position, context, token, next) {
			if (!isInsideHTMLRegion(document.getText(), document.offsetAt(position))) {
				return await next(document, position, context, token);
			}
			const result = await commands.executeCommand<CompletionList>(
				'vscode.executeCompletionItemProvider',
				vdocUri(document),
				position,
				context.triggerCharacter
			);
			// filter valid items
			result.items = result.items.filter((i) => i.kind === CompletionItemKind.Property
				|| i.kind === CompletionItemKind.Value);
			result.items = result.items.filter((i) => !i.label.toString().match(/aria-.*/g));

			return result;
		},
		async prepareRename(document, position, token, next) {
			if (!isInsideHTMLRegion(document.getText(), document.offsetAt(position))) {
				return await next(document, position, token);
			}
			const result = await commands.executeCommand<{ range: Range; placeholder: string; }>(
				'vscode.prepareRename',
				vdocUri(document),
				position
			);
			// If empty space for vanila HTML.
			if (result.range.isEmpty) {
				const line = document.lineAt(position.line);
				const re = /<\s*(\w+)\s*\/>/g; // matches `< FunctionalComponent />` declaration 
				for (const match of line.text.matchAll(re)) {
					const start = match.index + match[0].indexOf(match[1]);
					const end = start + match[1].length - 1;
					const range = new Range(position.line, start, position.line, end);
					if (range.contains(position)) {
						return {
							range: new Range(position.line, start, position.line, end),
							placeholder: match[1],
						};
					}
				}
				return result;
			}
			return result;
		},
		async provideRenameEdits(document, position, newName, token, next) {
			if (!isInsideHTMLRegion(document.getText(), document.offsetAt(position))) {
				return await next(document, position, newName, token);
			}
			const edit: WorkspaceEdit = new WorkspaceEdit();
			const flat = await getFlattenSymbols(document);

			const symbol = flat.filter((s) => {
				return s.range.start.line === position.line || s.range.end.line === position.line;
			}).find((s) => {
				const { length } = getSymbolShortName(s.name);
				const { character } = position;
				const { start, end } = s.range;
				return ((start.character < character && character <= start.character + length + 1)
					|| (end.character - length - 1 <= character && character < end.character));

			});

			if (symbol) {
				const { start, end } = symbol.range;
				const { length } = getSymbolShortName(symbol.name);
				edit.set(document.uri, [
					new TextEdit(new Range(new Position(end.line, end.character - 1 - length),
						new Position(end.line, end.character - 1),), newName),
					new TextEdit(new Range(new Position(start.line, start.character + 1),
						new Position(start.line, start.character + 1 + length)), newName),
				]);
			}
			return edit;
		},
		async provideHover(document, position, token, next) {
			if (!isInsideHTMLRegion(document.getText(), document.offsetAt(position))) {
				return await next(document, position, token);
			}
			const result = await commands.executeCommand<Hover[]>(
				'vscode.executeHoverProvider',
				vdocUri(document),
				position,
			);
			return result[0];
		},
		async provideDocumentSymbols(document, token, next) {
			if (!isValidHTMLMacro(document.getText())) {
				return next(document, token);
			}
			// FIXME: [1] result is undefined for a long time, perhaps HTML Language Service isn't started yet?
			// TEMP: try again every 1s, timeout at 5 times.

			return await getFlattenSymbols(document);
		}
	}
};

async function getFlattenSymbols(document: TextDocument): Promise<DocumentSymbol[]> {
	let result = undefined;
	for (let counter = 0; counter < 5 && !result; counter++) {
		result = await commands.executeCommand<DocumentSymbol[]>(
			'vscode.executeDocumentSymbolProvider',
			vdocUri(document),
		);
	}
	return flattenDocumentSymbols(result);
}