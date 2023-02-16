import * as vscode from 'vscode';
import * as cheerio from 'cheerio';
import { TreeNode } from "../treeExplorer/treeNode";
import * as source from '../sour.json';
import { utils } from '../utils';

export async function search(bookName: string, id: number): Promise<TreeNode[]> {
    const sourceItem = source[id];
    const searchUrl = utils.addUrlPrefix(sourceItem.searchUrl, sourceItem.bookSourceUrl).replace('{{key}}', encodeURIComponent(bookName));
    const $ = cheerio.load(await utils.fetchWithCharset(searchUrl));
    const rule = utils.getSearchRule(id);

    const bookList: TreeNode[] = [];
    $(rule.bookList).each((index, element) => {
        const author = $(element).find(rule.author).text();
        const bookUrl = $(element).find(rule.bookUrl).attr('href') || "";
        const match = bookUrl.match(rule.bookIdReg);
        const bookId = match ? match[1] : 0;
        const name = $(element).find(rule.name).text();
        const wordCount = $(element).find(rule.wordCount).text();
        if (0 === bookId) {
            return;
        }
        bookList.push(new TreeNode({ name: `${name}-${author}-${wordCount}`, author, wordCount, ruleId: id, bookId }, vscode.TreeItemCollapsibleState.Collapsed));
    });

    return bookList;
}

export async function getChapter(node: TreeNode): Promise<TreeNode[]> {
    const $ = cheerio.load(await utils.fetchWithCharset(node.path));
    const rule = utils.getChapterRule(node.ruleId);

    let chapters: TreeNode[] = [];
    $(rule.chapterList).each((index, element) => {
        const chapterUrl = $(element).find(rule.chapterName).attr(rule.chapterUrl) || "";
        const match = chapterUrl.match(rule.chapterIdReg);
        const chapterId = match ? match[1] : 0;

        let chapter = new TreeNode({
            parent: node,
            name: $(element).find(rule.chapterName).text(),
            chapterId: chapterId,
            ruleId: node.ruleId,
        }, vscode.TreeItemCollapsibleState.None);
        chapters.push(chapter);

        node.addChildren(chapter);
    });
    return chapters;
}

export async function getContent(node: TreeNode): Promise<string> {
    const html = await utils.fetchWithCharset(node.path);
    const $ = cheerio.load(html);

    const rule = utils.getContentRule(node.ruleId);
    const content = $(rule.content).text();
    return `${node.name}。\n${content}`;
}

