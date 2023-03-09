import * as sites from '../sour.json';

export class Book {
    private name: string;
    private author: string;
    private bookId: string;
    private wordCount: string;
    private ruleId: number;

    constructor(name: string, author: string, bookId: string, wordCount: string, ruleId: number) {
        this.name = name;
        this.author = author;
        this.bookId = bookId;
        this.wordCount = wordCount;
        this.ruleId = ruleId;
    }
    public getName(): string {
        return this.name;
    }
    public getAuthor(): string {
        return this.author;
    }
    public getBookId(): string {
        return this.bookId;
    }
    public getWordCount(): string {
        return this.wordCount;
    }
    public getRuleId(): number {
        return this.ruleId;
    }
    get siteName(): string {
        return sites[this.ruleId].bookSourceName;
    }
}

export class Chapter {

}