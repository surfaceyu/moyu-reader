import * as vscode from 'vscode';
import { Commands } from '../config';
import { utils } from '../utils';
import { getChapter } from '../driver/driver';

export class TreeNode extends vscode.TreeItem {
    protected data;
    protected parent: TreeNode;
    protected childs: TreeNode[];

    constructor(data: any, collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None) {
        super(data.name, collapsibleState);
        this.data = data;
        this.parent = this.data.parent;
        this.childs = [];
    }

    get name(): string {
        return this.data.name;
    }
    get text(): string {
        return this.data.name;
    }
    get path(): string {
        throw new Error("请去重写该方法");
    }
    get siteName(): string {
        throw new Error("请去重写该方法");
    }
    get parentNode(): TreeNode {
        return this.parent;
    }
    public async getChildren(): Promise<TreeNode[]> {
        return this.childs;
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

export class BookNameTreeNode extends TreeNode {
    constructor(name: string, author: string) {
        const data = {
            name,
            author,
        };
        super(data, vscode.TreeItemCollapsibleState.Collapsed);
        this.parent = this.data.parent;
    }
    get text(): string {
        return this.data.name;
    }
    get author(): string {
        return this.data.author;
    }

    contextValue = 'BookNameTreeNode'; //提供给 when 使用
}

export class BookSiteTreeNode extends TreeNode {
    constructor(name: string, ruleId: number, bookId: string, parent:TreeNode) {
        const data = {name, ruleId, bookId};
        super(data, vscode.TreeItemCollapsibleState.Collapsed);
        this.parent = parent;
    }
    get text(): string {
        return this.data.name;
    }
    get path(): string {
        const source = utils.getRule();
        const url = source[this.ruleId].ruleToc.url;
        return url.replace('{{bookId}}', this.bookId);
    }
    get ruleId(): number {
        return this.data.ruleId;
    }
    public async getChildren(): Promise<TreeNode[]> {
        return await getChapter(this);
    }
    get siteName(): string {
        const source = utils.getRule();
        return source[this.ruleId].bookSourceName;
    }
}

// BookChapterTreeNode
export class BookChapterTreeNode extends TreeNode {
    constructor(name: string, ruleId: number, bookId: string, chapterId: string, parent:TreeNode) {
        super({name, ruleId, bookId, chapterId}, vscode.TreeItemCollapsibleState.None);
        this.parent = parent;
    }
    get text(): string {
        return this.data.name;
    }
    get path(): string {
        const source = utils.getRule();
        const url = source[this.ruleId].ruleContent.url;
        return url.replace('{{bookId}}', this.bookId)
            .replace('{{chapterId}}', this.chapterId);
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
}