/**
 * Copyright (c) 2020 The UsaCon Authors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { parse } from "shell-quote";
import {TermOffset} from "./types";

export function wordBoundaries(input: string, leftSide:boolean = true) {
    let match;
    const words = [];
    const rx = /\w+/g;

    while ((match = rx.exec(input))) {
        if (leftSide) {
            words.push(match.index);
        } else {
            words.push(match.index + match[0].length);
        }
    }

    return words;
}

export function closestLeftBoundary(input:string, offset:number) : number {
    const found = wordBoundaries(input, true)
        .reverse()
        .find(x => x < offset);
    return found == null ? 0 : found;
}

export function closestRightBoundary(input:string, offset:number): number {
    const found = wordBoundaries(input, false).find(x => x > offset);
    return found == null ? input.length : found;
}

export function offsetToColRow(input:string, offset: number, maxCols:number) : TermOffset {
    let row = 0,
        col = 0;

    for (let i = 0; i < offset; ++i) {
        const chr = input.charAt(i);
        if (chr == "\n") {
            col = 0;
            row += 1;
        } else {
            col += 1;
            if (col > maxCols) {
                col = 0;
                row += 1;
            }
        }
    }

    return { row: row, col:col };
}

export function countLines(input:string, maxCols:number):number {
    return offsetToColRow(input, input.length, maxCols).row + 1;
}

export function isIncompleteInput(input: string): boolean {
    // Empty input is not incomplete
    if (input.trim() == "") {
        return false;
    }

    // Check for dangling single-quote strings
    if ((input.match(/'/g) || []).length % 2 !== 0) {
        return true;
    }
    // Check for dangling double-quote strings
    if ((input.match(/"/g) || []).length % 2 !== 0) {
        return true;
    }
    // Check for dangling boolean or pipe operations
    if (input.split(/(\|\||\||&&)/g).pop()?.trim() === "") {
        return true;
    }
    // Check for tailing slash
    if (input.endsWith("\\") && !input.endsWith("\\\\")) {
        return true;
    }

    return false;
}

export function hasTailingWhitespace(input: string) : boolean {
    return input.match(/[^\\][ \t]$/m) != null;
}

export function getLastToken(input: string): string {
    // Empty expressions
    if (input.trim() === "") return "";
    if (hasTailingWhitespace(input)) return "";

    // Last token
    const tokens = parse(input);
    const ret = tokens.pop();
    if (!ret) {
        return "";
    }
    return ret.toString();
}

