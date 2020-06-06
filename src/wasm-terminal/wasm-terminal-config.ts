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

// The configuration options passed when creating the Wasm terminal

import { WasmFs } from "@wasmer/wasmfs";
import CommandOptions from "./command/command-options";

export type CommandType = "GoWasm" | "WASI" | "Callback" | "Options";
export type CommandValue = {
  type: CommandType;
  value: Uint8Array | CallbackCommand | CommandOptions;
};

// A Custom command is a function that takes in a stdin string, and an array of argument strings,
// And returns an stdout string, or undefined.
export type CallbackCommand = (
  args: string[],
  wasmFs: WasmFs
) => Promise<string>;

type FetchCommandFunction = (options: {
  args: Array<string>;
  env?: { [key: string]: string };
}) => Promise<CommandValue>;

export default class WasmTerminalConfig {
  fetchCommand: FetchCommandFunction;
  processWorkerUrl?: string;

  wasmFs: WasmFs;

  constructor(config: any) {
    if (!config) {
      throw new Error("You must provide a config for the Wasm terminal.");
    }

    if (!config.fetchCommand) {
      throw new Error(
        "You must provide a fetchCommand for the Wasm terminal config, to handle fetching commands to be run"
      );
    }

    if (!config.processWorkerUrl) {
      console.warn(
        "Note: It is HIGHLY reccomended you pass in the processWorkerUrl in the terminal config to create process workers. Without this, some wasi programs will not work."
      );
    }

    // Assign our values
    this.fetchCommand = config.fetchCommand;
    this.processWorkerUrl = config.processWorkerUrl;

    if (config.wasmFs) {
      this.wasmFs = config.wasmFs;
    } else {
      this.wasmFs = new WasmFs();
    }
  }
}
