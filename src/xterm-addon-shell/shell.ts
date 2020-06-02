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

import {closestLeftBoundary, closestRightBoundary, countLines, isIncompleteInput, offsetToColRow} from "./utils";
import {IDisposable, IEvent, ITerminalAddon, Terminal} from "xterm";
import {TermSize} from "./types";
import {ShellHistory} from "./history";

declare interface ShellOption {
    historySize: number;
}

declare interface Prompt {
    prompt: string;
    continuationPrompt: string;
    resolve: (value?: string | PromiseLike<string>) => void;
    reject: (reason?: any) => void;
}

export class ShellAddon implements ITerminalAddon {
    term?: Terminal;
    readonly history: ShellHistory;
    private _active: boolean;
    private _input: string;
    private _cursor: number;
    private _activePrompt?: Prompt;
    private _activeCharPrompt?: Prompt;
    private _termSize: TermSize;
    private _disposables: IDisposable[];
    private _handleTermData: (v: string) => void;
    private _handleTermResize : (v: TermSize) => void;

    constructor(options: ShellOption = {historySize: 100}) {
        this.term = undefined;

        this._handleTermData = this.handleTermData.bind(this);
        this._handleTermResize = this.handleTermResize.bind(this);

        this.history = new ShellHistory(options.historySize);
        this._active = false;
        this._input = "";
        this._cursor = 0;
        this._activePrompt = undefined;
        this._activeCharPrompt = undefined;
        this._termSize = {
            cols: 0,
            rows: 0,
        };

        this._disposables = [];
    }

    // xterm.js new plugin API:
    public activate(term: Terminal): void {
        this.term = term;
        this.attach();
    }

    public dispose(): void {
        this.detach();
    }

    public detach(): void {
        this._disposables.forEach(d => d.dispose());
        this._disposables = [];
    }

    public attach(): void {
        if (!this.term) {
            return
        }
        this._disposables.push(this.term.onData(this._handleTermData));
        this._disposables.push(this.term.onResize(this._handleTermResize));
        this._termSize = {
            cols: this.term.cols,
            rows: this.term.rows,
        };
    }

    public read(prompt: string, continuationPrompt: string = "> "): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (this.term) {
                if (prompt !== "" ) {
                    this.term.write(prompt);
                }
                this._activePrompt = {
                    prompt,
                    continuationPrompt,
                    resolve,
                    reject
                };
            }
            this._input = "";
            this._cursor = 0;
            this._active = true;
        });
    }

    public readChar(prompt: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (this.term) {
                this.term.write(prompt);
            }
            this._activeCharPrompt = {
                prompt: prompt,
                continuationPrompt: "",
                resolve: resolve,
                reject: reject
            };
        });
    }

    public abortRead(reason: string = "aborted"): void {
        if (!this.term) {
            return
        }

        if (this._activePrompt || this._activeCharPrompt) {
            this.term.write("\r\n");
        }
        if (this._activePrompt) {
            this._activePrompt.reject(reason);
            this._activePrompt = undefined;
        }
        if (this._activeCharPrompt) {
            this._activeCharPrompt.reject(reason);
            this._activeCharPrompt = undefined;
        }
        this._active = false;
    }

    public clearAll() {
       this.clearInput();
       // Clear the screen
       this.term?.write("\u001b[2J");
       // Set the cursor to 0, 0
       this.term?.write("\u001b[0;0H");
    }

    println(message: string): void {
        this.print(message + "\n");
    }

    print(message: string): void {
        if (!this.term) {
            return
        }
        const normInput = message.replace(/[\r\n]+/g, "\n");
        this.term.write(normInput.replace(/\n/g, "\r\n"));
    }

    // printWide(items, padding:number = 2) {
    //     if (items.length == 0) return println("");
    //
    //     // Compute item sizes and matrix row/cols
    //     const itemWidth =
    //         items.reduce((width, item) => Math.max(width, item.length), 0) + padding;
    //     const wideCols = Math.floor(this._termSize.cols / itemWidth);
    //     const wideRows = Math.ceil(items.length / wideCols);
    //
    //     // Print matrix
    //     let i = 0;
    //     for (let row = 0; row < wideRows; ++row) {
    //         let rowStr = "";
    //
    //         // Prepare columns
    //         for (let col = 0; col < wideCols; ++col) {
    //             if (i < items.length) {
    //                 let item = items[i++];
    //                 item += " ".repeat(itemWidth - item.length);
    //                 rowStr += item;
    //             }
    //         }
    //         this.println(rowStr);
    //     }
    // }

    private applyPrompts(input: string): string {
        let prompt = "";
        let continuationPrompt = ""
        if (this._activePrompt) {
            prompt = this._activePrompt.prompt;
            continuationPrompt = this._activePrompt.continuationPrompt;
        }

        return prompt + input.replace(/\n/g, "\n" + continuationPrompt);
    }

    private applyPromptOffset(input: string, offset: number): number {
        const newInput = this.applyPrompts(input.substr(0, offset));
        return newInput.length;
    }

    private clearInput(): void {
        if (!this.term) {
            return
        }
        const currentPrompt = this.applyPrompts(this._input);

        // Get the overall number of lines to clear
        const allRows = countLines(currentPrompt, this._termSize.cols);

        // Get the line we are currently in
        const promptCursor = this.applyPromptOffset(this._input, this._cursor);
        const offset = offsetToColRow(
            currentPrompt,
            promptCursor,
            this._termSize.cols
        );

        // First move on the last line
        const moveRows = allRows - offset.row - 1;
        for (let i = 0; i < moveRows; ++i) this.term.write("\x1B[E");

        // Clear current input line(s)
        this.term.write("\r\x1B[K");
        for (let i = 1; i < allRows; ++i) this.term.write("\x1B[F\x1B[K");
    }

    private setInput(newInput: string, clearInput: boolean = true): void {
        if (!this.term) {
            return
        }
        // Clear current input
        if (clearInput) this.clearInput();

        // Write the new input lines, including the current prompt
        const newPrompt = this.applyPrompts(newInput);
        this.print(newPrompt);

        // Trim cursor overflow
        if (this._cursor > newInput.length) {
            this._cursor = newInput.length;
        }

        // Move the cursor to the appropriate row/col
        const newCursor = this.applyPromptOffset(newInput, this._cursor);
        const newLines = countLines(newPrompt, this._termSize.cols);
        const offset = offsetToColRow(
            newPrompt,
            newCursor,
            this._termSize.cols
        );
        const moveUpRows = newLines - offset.row - 1;

        this.term.write("\r");
        for (let i = 0; i < moveUpRows; ++i) this.term.write("\x1B[F");
        for (let i = 0; i < offset.col; ++i) this.term.write("\x1B[C");

        // Replace input
        this._input = newInput;
    }

    private printAndRestartPrompt(callback: () => Promise<() => void>): void {
        if (!this.term) {
            return;
        }
        const cursor = this._cursor;

        // Complete input
        this.setCursor(this._input.length);
        this.term.write("\r\n");

        // Prepare a function that will resume prompt
        const resume = () => {
            this._cursor = cursor;
            this.setInput(this._input);
        };

        // Call the given callback to echo something, and if there is a promise
        // returned, wait for the resolution before resuming prompt.
        const ret = callback();
        if (ret == null) {
            resume();
        } else {
            ret.then(resume);
        }
    }

    private setCursor(newCursor: number): void {
        if (!this.term) {
            return
        }

        if (newCursor < 0) newCursor = 0;
        if (newCursor > this._input.length) newCursor = this._input.length;

        // Apply prompt formatting to get the visual status of the display
        const inputWithPrompt = this.applyPrompts(this._input);
        const inputLines = countLines(inputWithPrompt, this._termSize.cols);

        // Estimate previous cursor position
        const prevPromptOffset = this.applyPromptOffset(this._input, this._cursor);
        const {col: prevCol, row: prevRow} = offsetToColRow(
            inputWithPrompt,
            prevPromptOffset,
            this._termSize.cols
        );

        // Estimate next cursor position
        const newPromptOffset = this.applyPromptOffset(this._input, newCursor);
        const {col: newCol, row: newRow} = offsetToColRow(
            inputWithPrompt,
            newPromptOffset,
            this._termSize.cols
        );

        // Adjust vertically
        if (newRow > prevRow) {
            for (let i = prevRow; i < newRow; ++i) this.term.write("\x1B[B");
        } else {
            for (let i = newRow; i < prevRow; ++i) this.term.write("\x1B[A");
        }

        // Adjust horizontally
        if (newCol > prevCol) {
            for (let i = prevCol; i < newCol; ++i) this.term.write("\x1B[C");
        } else {
            for (let i = newCol; i < prevCol; ++i) this.term.write("\x1B[D");
        }

        // Set new offset
        this._cursor = newCursor;
    }

    private handleCursorMove(dir: number): void {
        if (dir > 0) {
            const num = Math.min(dir, this._input.length - this._cursor);
            this.setCursor(this._cursor + num);
        } else if (dir < 0) {
            const num = Math.max(dir, -this._cursor);
            this.setCursor(this._cursor + num);
        }
    }

    private handleCursorErase(backspace: boolean): void {
        const {_cursor, _input} = this;
        if (backspace) {
            if (_cursor <= 0) return;
            const newInput = _input.substr(0, _cursor - 1) + _input.substr(_cursor);
            this.clearInput();
            this._cursor -= 1;
            this.setInput(newInput, false);
        } else {
            const newInput = _input.substr(0, _cursor) + _input.substr(_cursor + 1);
            this.setInput(newInput);
        }
    }

    private handleCursorInsert(data: string): void {
        const {_cursor, _input} = this;
        const newInput = _input.substr(0, _cursor) + data + _input.substr(_cursor);
        this._cursor += data.length;
        this.setInput(newInput);
    }

    private handleReadComplete(): void {
        if (!this.term) {
            return;
        }
        if (this.history) {
            this.history.push(this._input);
        }
        if (this._activePrompt) {
            this._activePrompt.resolve(this._input);
            this._activePrompt = undefined;
        }
        this.term.write("\r\n");
        this._active = false;
    }

    private handleTermResize(data: TermSize): void {
        this.clearInput();
        this._termSize = data;
        this.setInput(this._input, false);
    }

    private handleTermData(data: string): void {
        if (!this.term) return;
        if (!this._active) return;

        // If we have an active character prompt, satisfy it in priority
        if (this._activeCharPrompt) {
            this._activeCharPrompt.resolve(data);
            this._activeCharPrompt = undefined;
            this.term.write("\r\n");
            return;
        }

        // If this looks like a pasted input, expand it
        if (data.length > 3 && data.charCodeAt(0) !== 0x1b) {
            const normData = data.replace(/[\r\n]+/g, "\r");
            Array.from(normData).forEach(c => this.handleData(c));
        } else {
            this.handleData(data);
        }
    }

    handleData(data: string): void {
        if (!this._active) return;
        if (!this.term) return;

        const ord = data.charCodeAt(0);
        let ofs;

        // Handle ANSI escape sequences
        if (ord == 0x1b) {
            switch (data.substr(1)) {
                case "[A": // Up arrow
                    if (this.history) {
                        let value = this.history.getPrevious();
                        if (value) {
                            this.setInput(value);
                            this.setCursor(value.length);
                        }
                    }
                    break;

                case "[B": // Down arrow
                    if (this.history) {
                        let value = this.history.getNext();
                        if (!value) value = "";
                        this.setInput(value);
                        this.setCursor(value.length);
                    }
                    break;

                case "[D": // Left Arrow
                    this.handleCursorMove(-1);
                    break;

                case "[C": // Right Arrow
                    this.handleCursorMove(1);
                    break;

                case "[3~": // Delete
                    this.handleCursorErase(false);
                    break;

                case "[F": // End
                    this.setCursor(this._input.length);
                    break;

                case "[H": // Home
                    this.setCursor(0);
                    break;

                case "b": // ALT + LEFT
                    ofs = closestLeftBoundary(this._input, this._cursor);
                    if (ofs != null) this.setCursor(ofs);
                    break;

                case "f": // ALT + RIGHT
                    ofs = closestRightBoundary(this._input, this._cursor);
                    if (ofs != null) this.setCursor(ofs);
                    break;

                case "\x7F": // CTRL + BACKSPACE
                    ofs = closestLeftBoundary(this._input, this._cursor);
                    if (ofs != null) {
                        this.setInput(
                            this._input.substr(0, ofs) + this._input.substr(this._cursor)
                        );
                        this.setCursor(ofs);
                    }
                    break;
            }

            // Handle special characters
        } else if (ord < 32 || ord === 0x7f) {
            switch (data) {
                case "\r": // ENTER
                    if (isIncompleteInput(this._input)) {
                        this.handleCursorInsert("\n");
                    } else {
                        this.handleReadComplete();
                    }
                    break;

                case "\x7F": // BACKSPACE
                    this.handleCursorErase(true);
                    break;

                case "\t": // TAB
                    // if (this._autocompleteHandlers.length > 0) {
                    //     const inputFragment = this._input.substr(0, this._cursor);
                    //     const hasTailingSpace = hasTailingWhitespace(inputFragment);
                    //     const candidates = collectAutocompleteCandidates(
                    //         this._autocompleteHandlers,
                    //         inputFragment
                    //     );
                    //
                    //     // Sort candidates
                    //     candidates.sort();
                    //
                    //     // Depending on the number of candidates, we are handing them in
                    //     // a different way.
                    //     if (candidates.length === 0) {
                    //         // No candidates? Just add a space if there is none already
                    //         if (!hasTailingSpace) {
                    //             this.handleCursorInsert(" ");
                    //         }
                    //     } else if (candidates.length === 1) {
                    //         // Just a single candidate? Complete
                    //         const lastToken = getLastToken(inputFragment);
                    //         this.handleCursorInsert(
                    //             candidates[0].substr(lastToken.length) + " "
                    //         );
                    //     } else if (candidates.length <= this.maxAutocompleteEntries) {
                    //         // If we are less than maximum auto-complete candidates, print
                    //         // them to the user and re-start prompt
                    //         this.printAndRestartPrompt(() => {
                    //             this.printWide(candidates);
                    //         });
                    //     } else {
                    //         // If we have more than maximum auto-complete candidates, print
                    //         // them only if the user acknowledges a warning
                    //         this.printAndRestartPrompt(() =>
                    //             this.readChar(
                    //                 `Display all ${candidates.length} possibilities? (y or n)`
                    //             ).then(yn => {
                    //                 if (yn == "y" || yn == "Y") {
                    //                     this.printWide(candidates);
                    //                 }
                    //             })
                    //         );
                    //     }
                    // } else {
                    //     this.handleCursorInsert("    ");
                    // }
                    break;
                case "\x01": // CTRL+A
                    this.setCursor(0);
                    break;
                case "\x02": // CTRL+B
                    this.handleCursorMove(-1);
                    break;
                case "\x03": // CTRL+C
                    this.setCursor(this._input.length);
                    this.term.write("^C\r\n" + ((this._activePrompt || {}).prompt || ""));
                    this._input = "";
                    this._cursor = 0;
                    if (this.history) {
                        this.history.rewind();
                    }
                    break;
                case "\x05": // CTRL+E
                    this.setCursor(this._input.length-1);
                    break;
                case "\x06": // CTRL+F
                    this.handleCursorMove(1);
                    break;
                case "\x0c": // CTRL+L
                    this.term.clear();
                    break;
                case "\x17": // CTRL+W
                    ofs = closestLeftBoundary(this._input, this._cursor);
                    if (ofs != null) {
                        this.setInput(
                            this._input.substr(0, ofs) + this._input.substr(this._cursor)
                        );
                        this.setCursor(ofs);
                    }
                    break;
            }

            // Handle visible characters
        } else {
            this.handleCursorInsert(data);
        }
    }
}
