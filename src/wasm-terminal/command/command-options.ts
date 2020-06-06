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
import {CommandType} from "../wasm-terminal-config";

// Class that contains the "Options" for contructing and creating commands in a process

type CommandOptions = {
  type: CommandType
  args: string[];
  env: { [key: string]: string };
  preopens?: { [key: string]: string };
  module?: WebAssembly.Module;
  callback?: Function;
};

export default CommandOptions;
