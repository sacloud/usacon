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
    print(message: string): void
}

// TODO 名前変更、プロセスの起動/終了(ioの管理など)を行わせる
export class Runner {
    go: Go;
    printer: Printer;
    sfs: SimpleFs;

    wasmBuffer: BufferSource | null;
    readStdinCounter: number;

    private _initialized: boolean;
    get initialized(): boolean {
        return this._initialized;
    }

    constructor(printer: Printer) {
        // init memfs
        this.sfs = new SimpleFs();

        polyfillForGolang(this.sfs.fs);
        this.go = new Go();

        this.printer = printer;
        this._initialized = false;
        this.wasmBuffer = null;

        // TODO プロセス起動時に処理すべき
        this.sfs.volume.fds[1].node.write = this.stdoutWrite.bind(this); // stdout
        this.sfs.volume.fds[2].node.write = this.stdoutWrite.bind(this); // stderr

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
    }
}

