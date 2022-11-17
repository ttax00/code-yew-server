import * as path from 'path';
import { workspace, ExtensionContext, commands, Uri, CompletionList, TextDocument, DocumentSymbol, Hover, WorkspaceEdit, Range, Position, TextEdit } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';
import { flattenDocumentSymbols, getHTMLVirtualContent, isInsideHTMLRegion, isValidRustYew, unpackDocumentSymbolChildren as unpackDocumentSymbolChildren } from './embeddedHTML';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};
	const virtualDocumentContents = new Map<string, string>();

	workspace.registerTextDocumentContentProvider('embedded', {
		provideTextDocumentContent: uri => {
			console.log(`Returning URL: ${uri.toString(true)}`);
			const val = virtualDocumentContents.get(uri.toString(true));
			return val;
		}
	});

	function vdocUri(document: TextDocument) {
		const originalUri = document.uri.toString(true);
		const vdocUriString = `embedded://html/${encodeURIComponent(
			originalUri
		)}.html`;
		const vUri = Uri.parse(vdocUriString);

		virtualDocumentContents.set(vUri.toString(true), getHTMLVirtualContent(document.getText()));
		// virtualDocumentContents.set(vUri.toString(), "<div></div > ");
		return vUri;
	}


	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for rust documents
		documentSelector: [{ scheme: 'file', language: 'rustyew' }, { scheme: 'file', language: 'rust' }],
		middleware: {
			async provideCompletionItem(document, position, context, token, next) {
				// If not in `html! {}`, do not perform request forwarding
				if (!isInsideHTMLRegion(document.getText(), document.offsetAt(position))) {
					return await next(document, position, context, token);
				}
				const result = await commands.executeCommand<CompletionList>(
					'vscode.executeCompletionItemProvider',
					vdocUri(document),
					position,
					context.triggerCharacter
				);
				// filter aria-* items which are invalid
				result.items = result.items.filter((i) => !i.label.toString().match(/aria-.*/g));

				console.debug(result);
				return result;
			},
			async prepareRename(document, position, token, next) {
				// If not in `html! {}`, do not perform request forwarding
				if (!isInsideHTMLRegion(document.getText(), document.offsetAt(position))) {
					return await next(document, position, token);
				}
				const result = await commands.executeCommand<Range>(
					'vscode.prepareRename',
					vdocUri(document),
					position
				);
				return result;
			},
			async provideRenameEdits(document, position, newName, token, next) {
				// If not in `html! {}`, do not perform request forwarding
				if (!isInsideHTMLRegion(document.getText(), document.offsetAt(position))) {
					return await next(document, position, newName, token);
				}
				console.log("doing rename!");
				const edit: WorkspaceEdit = new WorkspaceEdit();
				const symbols = await commands.executeCommand<DocumentSymbol[]>(
					'vscode.executeDocumentSymbolProvider',
					vdocUri(document),
				);
				const flat = flattenDocumentSymbols(symbols);
				const symbol = flat.filter((s) => {
					return s.range.start.line === position.line || s.range.end.line === position.line;
				}).find((s) => {
					const { length } = s.name;
					const { character } = position;
					const { start, end } = s.range;
					return ((start.character < character && character <= start.character + length + 1)
						|| (end.character - length - 1 <= character && character < end.character));

				});

				if (symbol) {
					const { start, end } = symbol.range;
					edit.set(document.uri, [
						new TextEdit(new Range(new Position(end.line, end.character - 1 - symbol.name.length),
							new Position(end.line, end.character - 1),), newName),
						new TextEdit(new Range(new Position(start.line, start.character + 1),
							new Position(start.line, start.character + 1 + symbol.name.length)), newName),
					]);
				}


				console.log(position);
				console.log(symbol);
				console.log(edit);
				return edit;
			},
			async provideHover(document, position, token, next) {
				// If not in `html! {}`, do not perform request forwarding
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
				if (!isValidRustYew(document.getText())) {
					return next(document, token);
				}
				// FIXME: [1] result is undefined for a long time, perhaps HTML Language Service isn't started yet?
				// FIXME: [2] HTML document symbol provided are greatly missing!
				let result: undefined | DocumentSymbol[] = undefined;
				let count = 0;
				while (result === undefined && count < 5) {
					await new Promise(r => setTimeout(r, 1000));
					result = await commands.executeCommand<DocumentSymbol[]>(
						'vscode.executeDocumentSymbolProvider',
						vdocUri(document),
					);
					count++;
				}
				return flattenDocumentSymbols(result);
			}
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'rustYewServer',
		'Rust Yew Server',
		serverOptions,
		clientOptions
	);

	console.debug("server & client started");
	// Start the client. This will also launch the server
	client.start();
}



export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
