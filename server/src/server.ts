/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult
} from 'vscode-languageserver/node';
import { getLanguageService } from 'vscode-html-languageservice';
import {
	TextDocument
} from 'vscode-languageserver-textdocument';
import { rename } from 'fs';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

const htmlLanguageService = getLanguageService();

connection.onInitialize((_params: InitializeParams) => {
	return {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Full,
			// Tell the client that the server supports code completion
			completionProvider: {
				resolveProvider: false
			}
		}
	};
});

connection.onCompletion(async (completionParam, token) => {
	const document = documents.get(completionParam.textDocument.uri);
	if (!document) {
		return null;
	}

	return htmlLanguageService.doComplete(
		document,
		completionParam.position,
		htmlLanguageService.parseHTMLDocument(document)
	);
});

connection.onRenameRequest(async (renameParam, token) => {
	const document = documents.get(renameParam.textDocument.uri);
	if (!document) {
		return null;
	}
	console.debug(renameParam);
	return htmlLanguageService.doRename(document,
		renameParam.position,
		renameParam.newName,
		htmlLanguageService.parseHTMLDocument(document)
	);
});


// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
