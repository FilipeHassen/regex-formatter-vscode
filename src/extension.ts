import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DEFAULT_CONFIGS, mergeWithDefaults, FormatterRuleBlock } from './config';
import { RegexFormatter } from './formatter';

/**
 * Helper to get the file extension of the given document.
 */
function getFileExtension(document: vscode.TextDocument): string {
  const ext = path.extname(document.fileName);
  return ext ? ext.substring(1).toLowerCase() : '';
}

/**
 * Attempts to load configuration from the workspace root.
 * Returns the matching FormatterRuleBlock or undefined.
 */
function getConfigurationForFile(document: vscode.TextDocument): FormatterRuleBlock | undefined {
  const ext = getFileExtension(document);
  if (!ext) {
    return undefined;
  }

  // 1. Look for .regex-formatter.json in workspace folders
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
  if (workspaceFolder) {
    const configPath = path.join(workspaceFolder.uri.fsPath, '.regex-formatter.json');
    if (fs.existsSync(configPath)) {
      try {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        const userConfigs: Partial<FormatterRuleBlock>[] = JSON.parse(fileContent);

        if (Array.isArray(userConfigs)) {
          // Find if any user config block covers this extension
          const matchingUserBlock = userConfigs.find(block =>
            block.fileExtensions && block.fileExtensions.map(e => e.toLowerCase()).includes(ext)
          );
          if (matchingUserBlock) {
            return mergeWithDefaults(matchingUserBlock);
          }
        } else {
          vscode.window.showWarningMessage('O arquivo .regex-formatter.json deve ser um array JSON de blocos de configuração.');
        }
      } catch (err: any) {
        vscode.window.showErrorMessage(`Erro ao ler o arquivo .regex-formatter.json: ${err.message}`);
      }
    }
  }

  // 2. Fallback to built-in default configs
  const matchingDefault = DEFAULT_CONFIGS.find(d =>
    d.fileExtensions.map(e => e.toLowerCase()).includes(ext)
  );

  return matchingDefault;
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Regex Formatter is now active!');

  // Register command to create .regex-formatter.json config template
  const createConfigDisposable = vscode.commands.registerCommand('regex-formatter.createConfig', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('Por favor, abra um workspace ou pasta para poder criar o arquivo de configuração.');
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const configPath = path.join(rootPath, '.regex-formatter.json');

    if (fs.existsSync(configPath)) {
      const choice = await vscode.window.showInformationMessage(
        'O arquivo .regex-formatter.json já existe. Deseja sobrescrevê-lo com a configuração padrão?',
        'Sim',
        'Não'
      );
      if (choice !== 'Sim') {
        // Open the existing config file
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(configPath));
        await vscode.window.showTextDocument(doc);
        return;
      }
    }

    const template = [
      {
        "fileExtensions": ["java", "cs"],
        "indentSize": 4,
        "continuationIndentSize": 8,
        "bracesStyle": "sameLine",
        "breakBraceBlocks": true,
        "indentOnly": false,
        "forceReformat": false,
        "keepBlankLines": true,
        "lineBreakOnCharacters": [
          { 
            "char": ".", 
            "position": "before", 
            "requireParenthesis": true,
            "beforePattern": "",
            "afterPattern": ""
          }
        ],
        "spaces": {
          "insideParentheses": false,
          "insideBrackets": false,
          "insideBraces": true,
          "beforeParentheses": true
        },
        "commentAndStringRules": {
          "lineComment": "//",
          "blockCommentStart": "/*",
          "blockCommentEnd": "*/",
          "stringDelimiters": ["\"\"\"", "\"", "'"]
        },
        "customRules": [
          {
            "pattern": "System\\.out\\.println",
            "replace": "System.out.println",
            "description": "Exemplo de regra regex customizada"
          }
        ],
        "completeLinePatterns": [
          "^\\s*@"
        ]
      },
      {
        "fileExtensions": ["go"],
        "indentSize": 4,
        "continuationIndentSize": 4,
        "bracesStyle": "sameLine",
        "breakBraceBlocks": false,
        "indentOnly": false,
        "forceReformat": false,
        "keepBlankLines": true,
        "lineBreakOnCharacters": [
          { 
            "char": ".", 
            "position": "after", 
            "requireParenthesis": false,
            "beforePattern": "",
            "afterPattern": ""
          }
        ],
        "spaces": {
          "insideParentheses": false,
          "insideBrackets": false,
          "insideBraces": true,
          "beforeParentheses": false
        },
        "commentAndStringRules": {
          "lineComment": "//",
          "blockCommentStart": "/*",
          "blockCommentEnd": "*/",
          "stringDelimiters": ["\"", "`"]
        },
        "customRules": [],
        "completeLinePatterns": []
      },
      {
        "fileExtensions": ["json"],
        "indentSize": 4,
        "continuationIndentSize": 0,
        "bracesStyle": "sameLine",
        "breakBraceBlocks": true,
        "indentOnly": false,
        "forceReformat": true,
        "keepBlankLines": true,
        "lineBreakOnCharacters": [
          {
            "char": ",",
            "position": "after",
            "requireParenthesis": false,
            "beforePattern": "",
            "afterPattern": ""
          }
        ],
        "spaces": {
          "insideParentheses": false,
          "insideBrackets": false,
          "insideBraces": true,
          "beforeParentheses": false
        },
        "commentAndStringRules": {
          "lineComment": "",
          "blockCommentStart": "",
          "blockCommentEnd": "",
          "stringDelimiters": ["\""]
        },
        "customRules": [],
        "completeLinePatterns": []
      }
    ];

    try {
      fs.writeFileSync(configPath, JSON.stringify(template, null, 2), 'utf8');
      vscode.window.showInformationMessage('Arquivo .regex-formatter.json criado com sucesso!');

      const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(configPath));
      await vscode.window.showTextDocument(doc);
    } catch (err: any) {
      vscode.window.showErrorMessage(`Falha ao criar o arquivo de configuração: ${err.message}`);
    }
  });

  // Register document formatting provider for all files ('*')
  const formattingProviderDisposable = vscode.languages.registerDocumentFormattingEditProvider(
    { scheme: 'file', language: '*' },
    {
      provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] | undefined {
        const config = getConfigurationForFile(document);
        if (!config) {
          return undefined; // Let VS Code handle with other formatters
        }

        try {
          const formatter = new RegexFormatter(config);
          const originalText = document.getText();
          const formattedText = formatter.format(originalText);

          if (originalText === formattedText) {
            return [];
          }

          // Replace the entire document range
          const lastLine = document.lineAt(document.lineCount - 1);
          const range = new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(document.lineCount - 1, lastLine.text.length)
          );

          return [vscode.TextEdit.replace(range, formattedText)];
        } catch (err: any) {
          vscode.window.showErrorMessage(`Falha na formatação: ${err.message}`);
          return undefined;
        }
      }
    }
  );

  context.subscriptions.push(createConfigDisposable, formattingProviderDisposable);
}

export function deactivate() { }
