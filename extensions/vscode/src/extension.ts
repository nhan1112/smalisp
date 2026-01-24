import * as vscode from "vscode";
import { LanguageClient, TransportKind } from "vscode-languageclient/node";
import type {
    LanguageClientOptions,
    ServerOptions,
} from "vscode-languageclient/node";

let client: LanguageClient;

function createClient(): LanguageClient {
    const serverPath =
        vscode.workspace
            .getConfiguration("smalisp")
            .get<string>("serverPath") || "smalisp";
    const serverOptions: ServerOptions = {
        command: serverPath,
        args: []
    };
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: "file", language: "smali" }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher("**/*.smali"),
        },
    };
    return new LanguageClient(
        "smalisp",
        "Smalisp Language Server",
        serverOptions,
        clientOptions,
    );
}

export function activate(context: vscode.ExtensionContext) {
    client = createClient();
    client.start()
    context.subscriptions.push(client);
    context.subscriptions.push(
        vscode.commands.registerCommand("smalisp.restartServer", async () => {
            if (client) {
                try {
                    await client.stop();
                } catch {
                    // ignore
                }
                client = createClient();
                client.start();
            }
        }),
    );
}

export async function deactivate(): Promise<void> {
    if (!client) {
        return;
    }
    return client.stop();
}
