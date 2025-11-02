const vscode = require('vscode');

function activate(context) {
    let disposable = vscode.commands.registerCommand('super-suite-designer-tools.showSvgPreview', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            if (document.languageId === 'xml' || document.fileName.endsWith('.svg')) {
                const panel = vscode.window.createWebviewPanel(
                    'svgPreview',
                    'SVG Preview',
                    vscode.ViewColumn.Two,
                    {
                        enableScripts: false
                    }
                );
                panel.webview.html = getWebviewContent(document.getText());
            }
        }
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(svgContent) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SVG Preview</title>
</head>
<body>
    ${svgContent}
</body>
</html>`;
}

module.exports = {
    activate
};
