import * as vscode from 'vscode';
import * as source from '../sour.json';
import { getContent, search } from '../driver/driver';
import { treeDataProvider } from '../treeExplorer/bookTreeDataProvider';
import { BookNameTreeNode, BookSiteTreeNode, TreeNode } from '../treeExplorer/treeNode';
import { render } from '../utils';
import { Commands, DEBUG, DEBUG_INDEX } from '../config';
import { Book } from '../treeExplorer/entity';

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
    let bookList: Book[] = [];
    // 
    // bookNameCollect 以string为key TreeNode数组为value的map
    const bookNameCollect = new Map<string, TreeNode>();
    const funcs: any[] = [];
    if (DEBUG) {
        try {
            const books = await search(bookName, DEBUG_INDEX);
            bookList.push(...books);
        } catch (error) { }
    } else {
        source.forEach(async (item, id) => {
            funcs.push(new Promise(async resolve => {
                try {
                    const books = await search(bookName, id);
                    bookList.push(...books);
                    resolve(books);
                } catch (error) { }
                resolve([]);
            }));
        });
    }
    Promise.all(funcs).then((res) => {
        bookList.forEach(book => {
            const bookKey: string = `${book.getName()}-${book.getAuthor()}`;
            let bookNameNode = bookNameCollect.get(bookKey);
            if (!bookNameNode) {
                bookNameNode = new BookNameTreeNode(bookKey, book.getAuthor());
                bookNameCollect.set(bookKey, bookNameNode);
            } 
            const bookSiteNode = new BookSiteTreeNode(book.siteName, book.getRuleId(), book.getBookId(), bookNameNode);
            bookNameNode.addChildren(bookSiteNode);
        });
        // 将bookNameCollect.values() 转换为TreeNode数组
        treeDataProvider.setData(Array.from(bookNameCollect.values())).refresh();
    });
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