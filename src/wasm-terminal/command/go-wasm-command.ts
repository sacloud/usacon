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

// The class for Go Wasm Commands
import {WasmFs} from "@wasmer/wasmfs";

import Command from "./command";
import CommandOptions from "./command-options";
import {polyfillForGolang} from "./go/polyfill";
import Go from "./go/go";

export default class GoWasmCommand extends Command {
    constructor(options: CommandOptions) {
        super(options);

        if (!options.module) {
            throw new Error("Did not find a WebAssembly.Module");
        }

    }

    async run(wasmFs: WasmFs) {
        polyfillForGolang(wasmFs.fs);
        const go = new Go();

        const options = {
            env: this.options.env,
            args: this.options.args,
        };

        let wasmModule = this.options.module as WebAssembly.Module;
        let instance = await WebAssembly.instantiate(wasmModule, go.importObject);

        this.options.args[0] = "js";
        go.argv = this.options.args;

        // TODO 開発中はFakeモードをデフォルトONにしておく
        const fakes = {SAKURACLOUD_FAKE_MODE: "1"}
        go.env = {...fakes, ...(this.options.env || {})};
        return go.run(instance);
    }
}
