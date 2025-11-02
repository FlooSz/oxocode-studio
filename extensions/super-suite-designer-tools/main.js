const vscode = require('vscode');

function activate(context) {
    let disposable = vscode.commands.registerCommand('super-suite-designer-tools.editSvg', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            if (document.languageId === 'xml' || document.fileName.endsWith('.svg')) {
                const panel = vscode.window.createWebviewPanel(
                    'svgEditor',
                    'SVG Editor',
                    vscode.ViewColumn.Two,
                    {
                        enableScripts: true
                    }
                );

                panel.webview.html = getWebviewContent(document.getText());

                // Handle messages from the webview
                panel.webview.onDidReceiveMessage(
                    message => {
                        switch (message.command) {
                            case 'save':
                                const edit = new vscode.WorkspaceEdit();
                                edit.replace(
                                    document.uri,
                                    new vscode.Range(0, 0, document.lineCount, 0),
                                    message.text
                                );
                                vscode.workspace.applyEdit(edit);
                                return;
                        }
                    },
                    undefined,
                    context.subscriptions
                );
            }
        }
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(svgContent) {
    const fabricJsUri = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js';
    const escapedSvgContent = svgContent.replace(/`/g, '\\`').replace(/\$/g, '\\$');

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SVG Editor</title>
    <script src="${fabricJsUri}"></script>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background-color: #f0f0f0;
        }
        #editor-controls {
            padding: 10px;
            background-color: #3c3c3c;
            border-bottom: 1px solid #ccc;
        }
        #canvas-wrapper {
            flex-grow: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px;
        }
        canvas {
            border: 1px solid #ccc;
            background-color: white;
        }
    </style>
</head>
<body>
    <div id="editor-controls">
        <button id="save-button">Save Changes</button>
    </div>
    <div id="canvas-wrapper">
        <canvas id="c"></canvas>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const canvas = new fabric.Canvas('c');
        const initialSvgContent = \`${escapedSvgContent}\`;

        fabric.loadSVGFromString(initialSvgContent, function(objects, options) {
            const obj = fabric.util.groupSVGElements(objects, options);
            canvas.add(obj);
            canvas.setWidth(obj.width);
            canvas.setHeight(obj.height);
            canvas.renderAll();
        });

        const saveButton = document.getElementById('save-button');
        saveButton.addEventListener('click', () => {
            const updatedSvg = canvas.toSVG();
            vscode.postMessage({
                command: 'save',
                text: updatedSvg
            });
        });

    </script>
</body>
</html>`;
}

module.exports = {
    activate
};
