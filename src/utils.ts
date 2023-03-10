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
        const response = await fetch(url, {timeout: 10*1000});
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

            vscode.workspace.openTextDocument(filePath).then(document => {
                vscode.window.showTextDocument(document).then(editor => {
                    let firstLine = editor.document.lineAt(0);
                    let firstLineRange = new vscode.Range(firstLine.range.start, firstLine.range.start);
                    editor.revealRange(firstLineRange, vscode.TextEditorRevealType.AtTop);
                });
            });
        });
    }

    const tsCode = `
/** ???????????????????????? */
function add(x: number, y: number): number {
  const sum = x + y;

  /** ???????????? */
  return sum;
}

interface Admin {
    name: string;
    privileges: string[];
  }
  
  interface Employee {
    name: string;
    startDate: Date;
  }
  
  type UnknownEmployee = Employee | Admin;
  
  /** printEmployeeInformation */
  function printEmployeeInformation(emp: UnknownEmployee) {
    console.log("Name: " + emp.name);
    if ("privileges" in emp) {
      console.log("Privileges: " + emp.privileges);
    }
    if ("startDate" in emp) {
      console.log("Start Date: " + emp.startDate);
    }
  }

/** ???????????????????????? */
function multiply(x: number, y: number): number {
  const product = x * y;

  /** ???????????? */
  return product;
}

/** ????????????????????????????????? */
function factorial(n: number): number {
  if (n <= 1) {
    return 1;
  }

  /** ?????????????????????????????????n-1???????????????????????????n?????? */
  return n * factorial(n - 1);
}
type Foo = string | number;

function controlFlowAnalysisWithNever(foo: Foo) {
  if (typeof foo === "string") {
    /** ?????? foo ???????????? string ?????? */
  } else if (typeof foo === "number") {
    /** ?????? foo ???????????? number ?????? */
  } else {
    /** foo ???????????? never */
    const check: never = foo;
  }
}
`;

    function splitSentences(str: string): string[] {
        const regex = /(.+?)([???!??????\????]+|$)/g;
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
        const regex = /\/\*\*[^]*?\*\//g; // ??????????????????
        let matches = code.match(regex) || []; // ?????????????????????????????????
        let codeCopy = code; // ??????????????????
        for (let j = 0; j < matches.length; j++) {
            // ????????????
            if (i <  strings.length) {
                codeCopy = codeCopy.replace(matches[j], "// " + strings[i]);
                i++;                
            } else {
                codeCopy = codeCopy.replace(matches[j], "");
            }
        }
        if (i < strings.length) {
            return codeCopy + insertComments(strings, code, i);
        };
        return codeCopy;
    }
}
