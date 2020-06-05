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

import WasmTerminal from "./wasm-terminal";
import {WasmFs} from "@wasmer/wasmfs";
import {BuiltinCommands} from "./commands";

const usaconBanner =
    `=============================================================================\x1B[37m
           _   _             _____                       _      
          | | | |           /  __ \\                     | |     
          | | | |___  __ _  | /  \\/ ___  _ __  ___  ___ | | ___ 
          | | | / __|/ _\` | | |    / _ \\| '_ \\/ __|/ _ \\| |/ _ \\
          | |_| \\__ \\ (_| | | \\__/\\ (_) | | | \\__ \\ (_) | |  __/
           \\___/|___/\\__,_|  \\____/\\___/|_| |_|___/\\___/|_|\\___|
\x1B[0m                                                    
               \x1B[4m\x1B[1;34mWeb Console for using Usacloud Web Assembly\x1B[0m
    
\x1B[3m\x1B[37mThis project is published under GNU AFFERO GENERAL PUBLIC LICENSE Version 3\x1B[0m
\x1B[3m\x1B[1;34mhttps://www.gnu.org/licenses/\x1B[0m

\x1B[3m\x1B[37m
Copyright (c) 2020 The UsaCon Authors\x1B[0m
=============================================================================`;

export class Console {
    wasmFs: WasmFs
    term: WasmTerminal

    constructor() {
        this.wasmFs = new WasmFs();
        this.term = new WasmTerminal({
            fetchCommand: this.fetch.bind(this),
            processWorkerUrl: chrome.runtime.getURL("worker.bundle.js"),
            wasmFs: this.wasmFs,
        })
        this.term.pendingPrintOnOpen = usaconBanner;
        this.term.initializer = this.init.bind(this);
    }

    open(root: HTMLElement) {
        this.term.open(root);
    }

    private async init() {
        BuiltinCommands.map(async c => {
            await this.installGoWasmCommand(c.name, await c.data());
        })
    }

    private async installGoWasmCommand(name: string, data: Uint8Array) {
        const path = `/bin/${name}`;
        if (!this.exists(path)) {
            this.wasmFs.fs.mkdirpSync("/bin");
            this.wasmFs.fs.writeFileSync(path, data);
        }
    }

    private async fetch({args, env}: {
        args: Array<string>,
        env?: { [key: string]: string },
    }) {
        const commandPath = `/bin/${args[0]}`;
        if (this.exists(commandPath)) {
            const data = this.wasmFs.fs.readFileSync(commandPath);
            if (typeof data !== "string") {
                return new Uint8Array(data);
            }
            throw new Error(`command '${args[0]}' has invalid file format`);
        }
        throw new Error(`command '${args[0]}' not found`);
    }

    private exists(path: string): boolean {
        return this.wasmFs.fs.existsSync(path);
    }
}

