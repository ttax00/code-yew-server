/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import { workspace, ExtensionContext, commands, Uri, CompletionList, WorkspaceEdit, ReferenceProvider, RenameProvider, Location, DocumentFormattingEditProvider, ProviderResult, CustomDocumentEditEvent } from 'vscode';
import { TextEdit } from 'vscode-html-languageservice';


import {
	LanguageClient,
	LanguageClientOptions,
	ProvideDocumentFormattingEditsSignature,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';
import { getHTMLVirtualContent, isInsideHTMLRegion } from './embeddedHTML';

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

	workspace.registerTextDocumentContentProvider('embedded-content', {
		provideTextDocumentContent: uri => {
			const originalUri = uri.path.slice(1).slice(0, -4);
			const decodedUri = decodeURIComponent(originalUri);
			return virtualDocumentContents.get(decodedUri);
		}
	});


	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for rust documents
		documentSelector: [{ scheme: 'file', language: 'rustyew' }],
		middleware: {
			provideCompletionItem: async (document, position, context, token, next) => {
				// If not in `html! {}`, do not perform request forwarding
				if (!isInsideHTMLRegion(document.getText(), document.offsetAt(position))) {
					return await next(document, position, context, token);
				}
				console.log("doing complete!");

				const originalUri = document.uri.toString(true);
				virtualDocumentContents.set(originalUri, getHTMLVirtualContent(document.getText()));

				const vdocUriString = `embedded-content://html/${encodeURIComponent(
					originalUri
				)}.html`;
				const vdocUri = Uri.parse(vdocUriString);
				return await commands.executeCommand<CompletionList>(
					'vscode.executeCompletionItemProvider',
					vdocUri,
					position,
					context.triggerCharacter
				);
			},
			provideRenameEdits: async (document, position, newName, token, next) => {
				// If not in `html! {}`, do not perform request forwarding
				if (!isInsideHTMLRegion(document.getText(), document.offsetAt(position))) {
					return await next(document, position, newName, token);
				}
				console.log("doing rename!");

				const originalUri = document.uri.toString(true);
				virtualDocumentContents.set(originalUri, getHTMLVirtualContent(document.getText()));

				const vdocUriString = `embedded-content://html/${encodeURIComponent(
					originalUri
				)}.html`;

				const vdocUri = Uri.parse(vdocUriString);
				return await commands.executeCommand<WorkspaceEdit>(
					'vscode.executeDocumentRenameProvider',
					vdocUri,
					position,
					newName
				);
			},
			provideDocumentFormattingEdits: async (document, options, token, next) => {
				console.log("doing formatting!");

				const originalUri = document.uri.toString(true);
				virtualDocumentContents.set(originalUri, getHTMLVirtualContent(document.getText()));

				const vdocUriString = `embedded-content://html/${encodeURIComponent(
					originalUri
				)}.html`;

				const vdocUri = Uri.parse(vdocUriString);
				return await commands.executeCommand<any>(
					'vscode.executeFormatDocumentProvider',
					vdocUri,
					options
				);
			},
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
