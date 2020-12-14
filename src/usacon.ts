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
import { WasmFs } from "@wasmer/wasmfs";
import { BuiltinCommands } from "./commands";
import APIKey from "./api-key";
import * as constants from "constants";
import Constants from "@sacloud/constants";

const usaconBanner = `=============================================================================\x1B[37m
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

export class Usacon {
  wasmFs: WasmFs;
  term: WasmTerminal;

  apiKey?: APIKey;

  constructor() {
    this.wasmFs = new WasmFs();
    this.term = new WasmTerminal({
      fetchCommand: this.fetch.bind(this),
      processWorkerUrl: chrome.runtime.getURL("worker.bundle.js"),
      wasmFs: this.wasmFs,
    });
    this.term.pendingPrintOnOpen = usaconBanner;
    this.term.initializer = this.init.bind(this);
    this.apiKey = undefined;
  }

  open(root: HTMLElement) {
    if (this.isOpen) {
      return;
    }
    this.term.open(root);
    this.term.fit();
  }

  get isOpen(): boolean {
    return this.term.isOpen;
  }

  fit() {
    if (this.term.isOpen) {
      this.term.fit();
    }
  }

  private async init() {
    BuiltinCommands.filter((c) => c.needInstall(this.wasmFs)).map(
      async (c) => await c.install(this.wasmFs)
    );
  }

  private get zoneName(): string {
    const zoneID = localStorage.getItem("/cloud/::currentZoneId");
    if (zoneID) {
      for (const k in Constants.Zone.IDs) {
        if (Constants.Zone.IDs[k].toString() === zoneID) {
          return k;
        }
      }
    }
    return "";
  }

  private async fetch({
    args,
    env,
  }: {
    args: Array<string>;
    env?: { [key: string]: string };
  }) {
    const commandName = args[0];
    const commandDef = BuiltinCommands.find((c) => c.name === commandName);
    if (!commandDef) {
      throw new Error(`command '${commandName}' not found`);
    }

    const data = await commandDef.fetchCommand(this.wasmFs);

    const additionalEnvs = new Map<string, string>();
    if (this.apiKey) {
      additionalEnvs.set("SAKURACLOUD_ACCESS_TOKEN", this.apiKey.token);
      additionalEnvs.set("SAKURACLOUD_ACCESS_TOKEN_SECRET", this.apiKey.secret);
    } else {
      additionalEnvs.set("SAKURACLOUD_FAKE_MODE", "1");
    }
    additionalEnvs.set("SAKURACLOUD_ZONE", this.zoneName);

    return {
      type: commandDef.type,
      value: data,
      additionalEnvs: additionalEnvs,
    };
  }
}
