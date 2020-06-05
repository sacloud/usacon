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

import './css/content.css';
import './css/xterm.css';
import './css/xterm_customize.css';
import {Console} from "./console";

const rootId = "chrome-sacloud-console-root";

function init() {
    const root = initRootElement();
    const console = new Console();
    console.open(root);
}

function initRootElement(): HTMLElement {
    let root = document.getElementById(rootId);
    if (!root) {
        root = createRootElement();
    }
    return root;
}

function createRootElement(): HTMLElement {
    let root = document.createElement("div")
    root.setAttribute("id", rootId)

    let parents = document.getElementsByTagName("body");
    parents[0].appendChild(root);

    return root
}

// entry point
window.addEventListener('load', (e: Event) => {
    init();
});

