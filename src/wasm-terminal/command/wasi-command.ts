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

// The class for WASI Commands
import { WASI } from "@wasmer/wasi";
import { WasmFs } from "@wasmer/wasmfs";

import Command from "./command";
import CommandOptions from "./command-options";

export default class WASICommand extends Command {
  constructor(options: CommandOptions) {
    super(options);

    if (!options.module) {
      throw new Error("Did not find a WebAssembly.Module for the WASI Command");
    }
  }

  async run(wasmFs: WasmFs) {
    const options = {
      preopens: {
        ".": ".",
        "/": "/",
        ...(this.options.preopens || {}),
      },
      env: this.options.env,
      args: this.options.args,
      bindings: {
        ...WASI.defaultBindings,
        fs: wasmFs.fs,
      },
    };
    const wasi = new WASI(options);
    let wasmModule = this.options.module as WebAssembly.Module;
    let instance = await WebAssembly.instantiate(wasmModule, {
      ...wasi.getImports(wasmModule),
    });
    wasi.start(instance);
  }
}
