/**
 * Copyright (c) 2020-2022 The UsaCon Authors
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

import * as processWorker from "./wasm-terminal/workers/process.worker";
import { WASI, WASIBindings, WASIExitError, WASIKillError } from "@wasmer/wasi";
import hrtime from "@wasmer/wasi/lib/polyfills/browser-hrtime";

// @ts-ignore
import * as randomfill from "randomfill";
// @ts-ignore
import * as path from "path-browserify";

import getBigIntHrtime from "@wasmer/wasi/lib/polyfills/hrtime.bigint";

const bindings: WASIBindings = {
  hrtime: getBigIntHrtime(hrtime),
  exit: (code: number | null) => {
    throw new WASIExitError(code);
  },
  kill: (signal: string) => {
    throw new WASIKillError(signal);
  },
  randomFillSync: randomfill.randomFillSync,
  isTTY: () => true,
  path: path,

  // Let the user attach the fs at runtime
  fs: null,
};

WASI.defaultBindings = bindings;
export default processWorker;
