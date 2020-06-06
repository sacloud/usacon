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

import Command from "./command";
import CommandOptions from "./command-options";
import { WasmFs } from "@wasmer/wasmfs";

// The class for WASI Commands
export default class CallbackCommand extends Command {
  callback: Function;

  constructor(options: CommandOptions) {
    super(options);

    if (!options.callback) {
      throw new Error(
        "The Command Options provided are not for a Callback Command"
      );
    }

    this.callback = options.callback;
  }

  async run(wasmFs: WasmFs) {
    let str = await Promise.resolve(this.callback(this.options.args, wasmFs));
    if (typeof str == "string") {
      wasmFs.fs.writeFileSync(
        "/dev/stdout",
        new TextEncoder().encode(str + "\n")
      );
    }
  }
}
