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
import {CallbackCommand, CommandType} from "./wasm-terminal/wasm-terminal-config";
import {WasmFs} from "@wasmer/wasmfs";

export interface CommandDefValue {
    type: CommandType;
    name: string;
    source?: string;
    callback?: CallbackCommand;
}

export class CommandDef {
    type: CommandType;
    name: string;
    source?: string;
    callback?: CallbackCommand;

    constructor(v: CommandDefValue) {
        this.type = v.type;
        this.name = v.name;
        this.source = v.source;
        this.callback = v.callback;
    }

    private async getWasmBinaryFromUrl(url: string) {
        const fetched = await fetch(url);
        const buffer = await fetched.arrayBuffer();
        return new Uint8Array(buffer);
    }

    private get path(): string {
        return `/bin/${this.type}/${this.name}`;
    }

    needInstall(wasmFs: WasmFs): boolean {
        if (this.callback) {
            return false;
        }
        return !wasmFs.fs.existsSync(this.path)
    }

    install(wasmFs: WasmFs): Promise<void>{
        return new Promise<void>( (resolve) => {
            if (!this.source) {
                throw new Error("invalid command definition");
            }
            if (wasmFs.fs.existsSync(this.path)) {
                resolve();
                return
            }
            this.getWasmBinaryFromUrl(this.source).then( (data) => {
                wasmFs.fs.mkdirpSync("/bin");
                wasmFs.fs.mkdirpSync("/bin/GoWasm");
                wasmFs.fs.mkdirpSync("/bin/WASI")
                wasmFs.fs.writeFileSync(this.path, data);
                resolve()
            });
        })
    }

    async fetchCommand(wasmFs: WasmFs): Promise<Uint8Array | CallbackCommand> {
        if (!this.callback && !this.source) {
            throw new Error("invalid command definition");
        }
        if (this.callback) {
            return this.callback;
        }

        // fetch
        if (wasmFs.fs.existsSync(this.path)) {
            const data = wasmFs.fs.readFileSync(this.path);
            if (typeof data !== "string") {
                return new Uint8Array(data);
            }
            throw new Error(`command '${this.name}' has invalid file format`);
        }

        throw new Error(`command '${this.name}' is not installed`);
    }
}

export const BuiltinCommands: CommandDef[] = [
    new CommandDef({
        type: "GoWasm",
        name: "usacloud",
        source: chrome.runtime.getURL("usacloud.wasm"),
    }),
    new CommandDef({
        type: "WASI",
        name: "jq",
        source: chrome.runtime.getURL("jq.wasm"),
    }),
    new CommandDef({
        type: "WASI",
        name: "echo",
        source: chrome.runtime.getURL("uutils.wasm"),
    }),
    new CommandDef({
        type: "WASI",
        name: "wc",
        source: chrome.runtime.getURL("uutils.wasm"),
    }),
    new CommandDef({
        type: "WASI",
        name: "env",
        source: chrome.runtime.getURL("uutils.wasm"),
    }),
    new CommandDef({
        type: "Callback",
        name: "clear",
        callback: (args:string[],wasmFs:WasmFs):Promise<string> => {
            return new Promise<string>((resolve) => {
                resolve("\u001b[2J\u001b[0;0H");
            })
        }
    }),
    new CommandDef({
        type: "Callback",
        name: "cls",
        callback: (args:string[],wasmFs:WasmFs):Promise<string> => {
            return new Promise<string>((resolve) => {
                resolve("\u001b[2J\u001b[0;0H");
            })
        }
    }),
    new CommandDef({
        type: "Callback",
        name: "#",
        callback: (args:string[],wasmFs:WasmFs):Promise<string> => {
            return new Promise<string>((resolve) => resolve());
        }
    }),
    new CommandDef({
        type: "Callback",
        name: ":",
        callback: (args:string[],wasmFs:WasmFs):Promise<string> => {
            return new Promise<string>((resolve) => resolve());
        }
    }),
]

