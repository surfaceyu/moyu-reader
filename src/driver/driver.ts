import * as cheerio from 'cheerio';
import { BookChapterTreeNode, TreeNode } from "../treeExplorer/treeNode";
import { utils } from '../utils';
import { Book } from '../treeExplorer/entity';

export async function search(bookName: string, id: number): Promise<Book[]> {
    const source = utils.getRule();
    const sourceItem = source[id];
    const searchUrl = utils.addUrlPrefix(sourceItem.searchUrl, sourceItem.bookSourceUrl).replace('{{key}}', encodeURIComponent(bookName));
    const html = await utils.fetchWithCharset(searchUrl);
    const $ = cheerio.load(html);
    const rule = utils.getSearchRule(id);

    const bookList: Book[] = [];
    $(rule.bookList).each((index, element) => {
        const author = $(element).find(rule.author).text();
        const bookUrl = $(element).find(rule.bookUrl).attr('href') || "";
        let bookId = bookUrl;
        if (rule.bookIdReg) {
            const match = bookUrl.match(rule.bookIdReg);
            bookId = match ? match[1] : "0";
        }
        const name = $(element).find(rule.name).text().replace(/\n/g, "");
        const wordCount = $(element).find(rule.wordCount).text();
        if ("0" === bookId) {
            return;
        }
        bookList.push(new Book(name, author, bookId, wordCount, id));
    });
    return bookList;
}

export async function getChapter(node: TreeNode): Promise<TreeNode[]> {
    const html = await utils.fetchWithCharset(node.path);
    const $ = cheerio.load(html);
    const rule = utils.getChapterRule(node.ruleId);

    let chapters: BookChapterTreeNode[] = [];
    $(rule.chapterList).each((index, element) => {
        const chapterUrl = $(element).find(rule.chapterName).attr(rule.chapterUrl) || "";
        let chapterId = chapterUrl;
        if (rule.chapterIdReg) {
            const match = chapterUrl.match(rule.chapterIdReg);
            chapterId = match ? match[1] : "0";
        }
        let chapter = new BookChapterTreeNode($(element).find(rule.chapterName).text(), node.ruleId, node.bookId, chapterId, node);
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
    return `${node.text}。\n${content}`;
}

