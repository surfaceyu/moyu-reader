import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as vscode from 'vscode';
import { TreeNode } from './treeNode';
import { getChapter } from '../driver/driver';

export class BookTreeDataProvider implements vscode.TreeDataProvider<TreeNode> {

    private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined> = new vscode.EventEmitter<TreeNode | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined> = this._onDidChangeTreeData.event;

    private books: TreeNode[] = [];
    private curNode: TreeNode | undefined;

    constructor(books: TreeNode[]) {
        this.books = books;
    }

    setData(books: TreeNode[]): BookTreeDataProvider {
        this.books = books;
        return this;
    }

    getTreeItem(element: TreeNode): vscode.TreeItem {
        return {
            label: element.text,
            tooltip: element.text,
            iconPath: '',
            collapsibleState: element.collapsibleState,
            command: element.collapsibleState === vscode.TreeItemCollapsibleState.None ? element.previewCommand : undefined
        };
    }

    async getChildren(element?: TreeNode): Promise<TreeNode[]> {
        if (!element) {
            return this.books;
        }
        // return await getChapter(element);
        return await element.getChildren();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    set curData(curNode: TreeNode | undefined) {
        if (curNode) {            
            this.curNode = curNode;
        }
    }
    get curData(): TreeNode | undefined {
        return this.curNode;
    }
}

export const treeDataProvider = new BookTreeDataProvider([]);
