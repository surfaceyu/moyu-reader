import * as vscode from 'vscode';
import { Commands } from '../config';
import * as source from '../sour.json';

export class TreeNode extends vscode.TreeItem {
    private data;
    private parent: TreeNode;
    private childs: TreeNode[];

    constructor(data: any, collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None) {
        super(data.name, collapsibleState);
        this.data = data;
        this.parent = this.data.parent;
        this.childs = [];
    }
    get name(): string {
        return this.data.name;
    }
    get type() {
        return this.data.type;
    }
    get path(): string {
        if (this.chapterId && this.parent && this.parent.bookId) {
            const url = source[this.parent.ruleId].ruleContent.url;
            return url.replace('{{bookId}}', this.parent.bookId)
                .replace('{{chapterId}}', this.chapterId);
        }
        if (this.bookId) {
            const url = source[this.ruleId].ruleToc.url;
            return url.replace('{{bookId}}', this.bookId);
        }
        return "";
    }
    get parentNode(): TreeNode {
        return this.parent;
    }
    get children(): TreeNode[] {
        return this.children;
    }
    get ruleId(): number {
        return this.data.ruleId;
    }
    get bookId(): string {
        return this.data.bookId;
    }
    get chapterId(): string {
        return this.data.chapterId;
    }
    get previewCommand() {
        return {
            title: this.data.name,
            command: Commands.openReaderView,
            arguments: [this]
        };
    }
    addChildren(child: TreeNode) {
        this.childs.push(child);
    }
    prevChild(child: TreeNode): TreeNode | null {
        const index = this.childs.indexOf(child);
        const prev = index > 0 ? this.childs[index - 1] : null;
        return prev;
    }
    nextChild(child: TreeNode): TreeNode | null {
        const index = this.childs.indexOf(child);
        const next = index < this.childs.length - 1 ? this.childs[index + 1] : null;
        return next;
    }
}