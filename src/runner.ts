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

import Go from "./go/go";
import {polyfillForGolang} from "./go/polyfill";
import {SimpleFs} from './sfs/fs';
import {ShellAddon} from "./xterm-addon-shell/shell";

const USACLOUD_WASM_URL = "usacloud.wasm";

export interface Printer {
    read(prompt: string, continuationPrompt: string): Promise<string>

    print(message: string): void
}

// TODO 名前変更、プロセスの起動/終了(ioの管理など)を行わせる
export class Runner {
    go: Go;
    printer: ShellAddon; // TODO printer
    sfs: SimpleFs;

    wasmBuffer: BufferSource | null;
    readStdinCounter: number;

    private _initialized: boolean;
    get initialized(): boolean {
        return this._initialized;
    }

    constructor(printer: ShellAddon) { // TODO Printer
        // init memfs
        this.sfs = new SimpleFs();

        polyfillForGolang(this.sfs.fs);
        this.go = new Go();

        this.printer = printer;
        this._initialized = false;
        this.wasmBuffer = null;

        // TODO プロセス起動時に処理すべき
        this.sfs.volume.fds[0].node.read = this.stdinRead.bind(this); // stdin
        this.sfs.volume.fds[1].node.write = this.stdoutWrite.bind(this); // stdout
        this.sfs.volume.fds[2].node.write = this.stdoutWrite.bind(this); // stderr

        const ttyFd = this.sfs.volume.openSync("/dev/tty", "w+"); // tty
        this.sfs.volume.fds[ttyFd].node.read = this.stdinRead.bind(this);
        this.sfs.volume.fds[ttyFd].node.write = this.stdoutWrite.bind(this);

        this.readStdinCounter = 0;
    }

    onExit(callback: (code: number) => void): void {
        this.go.exit = callback;
    }

    async init(): Promise<void> {
        return fetch(chrome.runtime.getURL(USACLOUD_WASM_URL))
            .then(response => response.arrayBuffer())
            .then(bytes => {
                this.wasmBuffer = bytes;
                this._initialized = true;
            })
    }

    stdinRead(
        stdinBuffer: Buffer | Uint8Array,
        offset: number = 0,
        length: number = stdinBuffer.byteLength,
        position?: number
    ) {
        console.log("stdinRead", Date.now());
        const responseStdin = "y\n";
        const buffer = new TextEncoder().encode(responseStdin);

        const ttyFd = this.sfs.volume.openSync("/dev/tty", "w+");
        this.sfs.fs.writeSync(ttyFd,buffer,0, buffer.length, 0);

        // Return the current stdin
        return buffer.length;

        // console.log("stdinRead", stdinBuffer);
        // if (this.readStdinCounter % 2 !== 0) {
        //     this.readStdinCounter++;
        //     return 0;
        // }
        // let responseStdin: string | null = null;
        //
        // console.log("reading...");
        // this.printer.read("")
        //     .then((line) => {
        //         console.log("read:", responseStdin)
        //         responseStdin = line;
        //     })
        //     // .catch((e) => {
        //     //     console.error("stdinRead: error", e)
        //     //     this.printer.print(new TextEncoder().encode("\n").toString());
        //     //     const userError = new Error("Process killed by user");
        //     //     (userError as any).user = true;
        //     //     throw userError;
        //     //     return -1; // unreachable
        //     // });
        // // this.printer.read("")
        // //     .then((line) => {
        // //         console.log("read:", responseStdin)
        // //         responseStdin = line;
        // //     })
        // //     .catch((e) => {
        // //         console.error("stdinRead: error", e)
        // //         this.printer.print(new TextEncoder().encode("\n").toString());
        // //         const userError = new Error("Process killed by user");
        // //         (userError as any).user = true;
        // //         throw userError;
        // //         return -1; // unreachable
        // //     });
        //
        //
        // // responseStdin = prompt("");
        // // if (responseStdin === null) {
        // //     this.printer.print(new TextEncoder().encode("\n").toString());
        // //     const userError = new Error("Process killed by user");
        // //     (userError as any).user = true;
        // //     throw userError;
        // //     return -1; // unreachable
        // // }
        //
        //
        // //this.printer.print(new TextEncoder().encode(responseStdin).toString());
        // //console.log("write to tty", responseStdin);
        // // const ttyFd = this.sfs.volume.openSync("/dev/tty", "w+"); // tty
        // // return this.sfs.volume.writeSync(ttyFd, new TextEncoder().encode(responseStdin));
        //
        // // // First check for errors
        // if (!responseStdin) {
        //     return 0;
        // }
        // //
        // const buffer = new TextEncoder().encode(responseStdin);
        // // Return the current stdin
        // return buffer.length;
    }

    private stdoutWrite(
        buf: Buffer | Uint8Array,
        offset: number = 0,
        length: number = buf.byteLength,
        position?: number
    ) {
        this.printer.print(buf.toString());
        return buf.length;
    }

    exec(args: string[]) {
        if (!this.initialized || !this.wasmBuffer) {
            return
        }
        WebAssembly.instantiate(this.wasmBuffer, this.go.importObject)
            .then((wasm) => {
                this.go.argv = ["js"].concat(args);
                this.go.run(wasm.instance)
                    .then(() => {
                        return;
                    });
            });
    }

    setEnvs(envs: Map<string, string>): void {
        this.go.env = Object.fromEntries(envs);
        console.log("env:", this.go.env);
    }
}

