import * as vscode from 'vscode';
import { getContent, search } from '../driver/driver';
import { treeCacheDataProvider, treeDataProvider } from '../treeExplorer/bookTreeDataProvider';
import { BookNameTreeNode, BookSiteTreeNode, TreeNode } from '../treeExplorer/treeNode';
import { render, utils, source } from '../utils';
import { Commands, DEBUG, DEBUG_INDEX } from '../config';
import { Book, CacheBook, CacheBookSite } from '../treeExplorer/entity';

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

export async function onUpdateCacheView(cacheData: CacheBook[]) {
    const bookNameCollect = new Map<string, TreeNode>();
    for (const cacheBook of cacheData) {        
        const bookKey: string = cacheBook.name;
        let bookNameNode = bookNameCollect.get(bookKey);
        if (!bookNameNode) {
            bookNameNode = new BookNameTreeNode(bookKey, cacheBook.author);
            bookNameCollect.set(bookKey, bookNameNode);
        }
        for (const it of cacheBook.children) {
			const iterator = new CacheBookSite(it.ruleId, it.bookId);
            const bookSiteNode = new BookSiteTreeNode(iterator.siteName, iterator.ruleId, iterator.bookId, bookNameNode);
            bookNameNode.addChildren(bookSiteNode);
        }
    }
    // 将bookNameCollect.values() 转换为TreeNode数组
    treeCacheDataProvider.setData(Array.from(bookNameCollect.values())).refresh();
}

export async function onCache(bookNode: BookNameTreeNode) {
    // 处理右键菜单项的点击事件
    let cacheData = utils.getCacheBook();

    const bookKey: string = bookNode.name;
    const cacheBook = new CacheBook(bookKey, bookNode.author);
    for (const iterator of await bookNode.getChildren()) {
        const bookSiteNode = new CacheBookSite(iterator.ruleId, iterator.bookId);
        cacheBook.addChildren(bookSiteNode);
    }
    cacheData.push(cacheBook);
    utils.saveCacheBook(cacheData);
    onUpdateCacheView(cacheData);
}

export async function onDeleteCache(bookNode: BookNameTreeNode) {
    // 处理右键菜单项的点击事件
    let cacheData = utils.getCacheBook();
    cacheData = cacheData.filter(it => {
        return it.name !== bookNode.text;
    });
    utils.saveCacheBook(cacheData);
    onUpdateCacheView(cacheData);
}