import * as vscode from 'vscode';
import * as source from '../sour.json';
import { getContent, search } from '../driver/driver';
import { treeDataProvider } from '../treeExplorer/bookTreeDataProvider';
import { TreeNode } from '../treeExplorer/treeNode';
import { render } from '../utils';
import { Commands, DEBUG } from '../config';

export async function searchOnline() {
    const bookName = await vscode.window.showInputBox({
        password: false,
        ignoreFocusOut: false,
        placeHolder: '请输入书名',
        prompt: ''
    });

    if (!bookName) {
        return;
    }
    let bookList: TreeNode[] = [];
    if (DEBUG) {
        try {
            const books = await search(bookName, 0);
            bookList.push(...books);
        } catch (error) { }
    } else {
        for (let id = 0; id < source.length; id++) {
            try {
                const books = await search(bookName, id);
                bookList.push(...books);
            } catch (error) { }
        }
    }
    treeDataProvider.setData(bookList).refresh();
};

export async function openReaderView(node: TreeNode) {
    const content = await getContent(node);
    render.show(content);
    // 保存当前node
    treeDataProvider.curData = node;
};

export async function onPrevClick() {
    const node = treeDataProvider.curData;
    if (!node) {
        return;
    }
    const prevNode = node.parentNode.prevChild(node);
    if (prevNode) {        
        vscode.commands.executeCommand(Commands.openReaderView, prevNode);
    }
}

export async function onNextClick() {
    const node = treeDataProvider.curData;
    if (!node) {
        return;
    }
    const nextNode = node.parentNode.nextChild(node);
    if (nextNode) {        
        vscode.commands.executeCommand(Commands.openReaderView, nextNode);
    }
}