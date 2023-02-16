import fetch from "node-fetch";
import iconv = require('iconv-lite');
import * as source from './sour.json';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export namespace utils {
    // utils toFix
    export function getSearchRule(searchId: number) {
        return source[searchId].ruleSearch;
    }

    export function getChapterRule(searchId: number) {
        return source[searchId].ruleToc;
    }

    export function getContentRule(searchId: number) {
        return source[searchId].ruleContent;
    }

    export function addUrlPrefix(url: string, prefix: string): string {
        if (!url.includes("http")) {
            return `${prefix}${url}`;
        } else {
            return url;
        }
    }

    export async function fetchWithCharset(url: string): Promise<string> {
        const response = await fetch(url);
        const buffer = await response.buffer();
        const contentType = response.headers.get('content-type');
        const charsetMatch = contentType ? contentType.match(/charset=(.*)/i) : "";
        const charset = charsetMatch ? charsetMatch[1].toLowerCase() : 'utf-8';
        const html = iconv.decode(buffer, charset);
        return html;
    }
}

export namespace render {
    export function show(content: string): void {
        writeAndOpenFile(insertComments(splitSentences(content), tsCode));
    }
    function writeAndOpenFile(content: string): void {
        const fileName = 'example.ts';
        const filePath = path.join(__dirname, fileName);

        fs.writeFile(filePath, content, { flag: "w" }, (err) => {
            if (err) {
                vscode.window.showErrorMessage(`Failed to write file: ${err.message}`);
                return;
            }

            vscode.workspace.openTextDocument(filePath).then((doc) => {
                vscode.window.showTextDocument(doc);
            });
        });
    }

    const tsCode = `
/** 这是一个加法函数 */
function add(x: number, y: number): number {
  /** 将两个数相加 */
  const sum = x + y;

  /** 返回结果 */
  return sum;
}

/** 这是一个乘法函数 */
function multiply(x: number, y: number): number {
  /** 将两个数相乘 */
  const product = x * y;

  /** 返回结果 */
  return product;
}

/** 这是一个计算阶乘的函数 */
function factorial(n: number): number {
  /** 如果n小于等于1，直接返回1 */
  if (n <= 1) {
    return 1;
  }

  /** 否则，递归调用函数计算n-1的阶乘，并将结果与n相乘 */
  return n * factorial(n - 1);
}
`;

    function splitSentences(str: string): string[] {
        const regex = /(.+?)([\.\?!。]+|$)/g;
        const sentences = str.match(regex) || [];
        const result: string[] = [];

        for (const sentence of sentences) {
            if (sentence.length > 140) {
                const words = sentence.split(' ');
                let temp = '';
                for (const word of words) {
                    if ((temp + word).length > 140) {
                        result.push(temp.trim());
                        temp = word + ' ';
                    } else {
                        temp += word + ' ';
                    }
                }
                result.push(temp.trim());
            } else {
                result.push(sentence.trim());
            }
        }
        return result;
    }

    function insertComments(strings: string[], code: string, i: number = 0): string {
        const regex = /\/\*\*[^]*?\*\//g; // 匹配多行注释
        let matches = code.match(regex) || []; // 所有注释的匹配结果数组
        let codeCopy = code; // 复制一份代码
        for (let j = 0; j < matches.length && i < strings.length; j++) {
            // 替换注释
            codeCopy = codeCopy.replace(matches[j], "// " + strings[i]);
            i++;
        }
        if (i < strings.length) {
            return codeCopy + insertComments(strings, code, i);
        };
        return codeCopy;
    }
}
