// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import path = require('path');
import * as vscode from 'vscode';
import * as commands from './commands';
import { Commands } from './config';
import { treeDataProvider } from './treeExplorer/bookTreeDataProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// 搜索
	vscode.commands.registerCommand(Commands.search, () => {
		commands.searchOnline();
	});
	vscode.commands.registerCommand(Commands.openReaderView, commands.openReaderView);

	vscode.window.registerTreeDataProvider('eReader-menu', treeDataProvider);

	// 创建上一页按钮
	const prevButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	prevButton.text = '上一页';
	prevButton.show();
	prevButton.command = Commands.onPrevClick;

	// 创建下一页按钮
	const nextButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	nextButton.text = '下一页';
	nextButton.show();
	nextButton.command = Commands.onNextClick;

	// 注册命令处理程序
	const prevCommand = vscode.commands.registerCommand(Commands.onPrevClick, commands.onPrevClick);
	const nextCommand = vscode.commands.registerCommand(Commands.onNextClick, commands.onNextClick);

	context.subscriptions.push(prevButton, nextButton, prevCommand, nextCommand);
}

// This method is called when your extension is deactivated
export function deactivate() { }