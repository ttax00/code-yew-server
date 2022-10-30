/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
	createConnection,
	ProposedFeatures,
	InitializeParams,
	TextDocumentSyncKind,
} from 'vscode-languageserver/node';


// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.

connection.onInitialize((_params: InitializeParams) => {
	console.log("server initialized");
	return {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Full,
			completionProvider: {
				resolveProvider: false
			},
			hoverProvider: true,
			documentSymbolProvider: true,
			renameProvider: true,
		}
	};
});
connection.onRenameRequest(() => null);
connection.onCompletion(() => null);
connection.onReferences(() => null);
connection.onDocumentSymbol(() => []);
connection.onDefinition(() => null);
connection.onHover(() => null);
connection.onTypeDefinition(() => null);


// Listen on the connection
connection.listen();
