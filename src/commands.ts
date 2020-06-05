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

export interface CommandDef {
    type: string // TODO supports only 'GoWasm'
    name: string
    data(): Promise<Uint8Array>;
}

async function getWasmBinaryFromUrl(url: string) {
    const fetched = await fetch(url);
    const buffer = await fetched.arrayBuffer();
    return new Uint8Array(buffer);
}

const usacloudCommand: CommandDef = {
    type: "GoWasm",
    name: "usacloud",
    data: () => getWasmBinaryFromUrl(chrome.runtime.getURL("usacloud.wasm")),
}

const envCommand: CommandDef = {
    type: "GoWasm",
    name: "env",
    data: () => getWasmBinaryFromUrl(chrome.runtime.getURL("env.wasm")),
}

export const BuiltinCommands: CommandDef[] = [
    usacloudCommand,
    envCommand,
]

