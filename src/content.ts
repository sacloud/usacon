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

// initialize app
import './css/content.css';
import './css/xterm.css';
import './css/xterm_customize.css';
import WasmTerminal, {fetchCommandFromWAPM} from "./console";

const rootId = "chrome-sacloud-console-root";
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

\x1B[3m\x1B[37mCopyright (c) 2020 The UsaCon Authors\x1B[0m
=============================================================================`;

function init() {
    // init UI element
    const root = initRootElement();
    let term = new WasmTerminal({
        fetchCommand: fetchCommand,
        processWorkerUrl: chrome.runtime.getURL("worker.bundle.js"),
    })
    term.pendingPrintOnOpen = usaconBanner;
    term.open(root);
}

const getWasmBinaryFromUrl = async (url: string) => {
    const fetched = await fetch(url);
    const buffer = await fetched.arrayBuffer();
    return new Uint8Array(buffer);
};

// TODO コマンドのプリフェッチなどを別途行う
export const fetchCommand = async ({args,  env}: {
    args: Array<string>,
    env?: {[key: string]: string},
}) => {
    let commandName = args[0];
    if (commandName === "usacloud") {
        const commandUrl = chrome.runtime.getURL("usacloud.wasm");
        return await getWasmBinaryFromUrl(commandUrl);
    }
    throw new Error(`command '${commandName}' not found`);
};


function initRootElement(): HTMLElement{
    let root = document.getElementById(rootId);
    if (!root) {
        root = createRootElement();
    }
    return root;
}

function createRootElement() : HTMLElement {
    let root = document.createElement("div")
    root.setAttribute("id", rootId)

    let parents = document.getElementsByTagName("body");
    parents[0].appendChild(root);

    return root
}

// entry point
window.addEventListener('load', (e:Event) => {
    init();
});

