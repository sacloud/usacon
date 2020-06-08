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

import "./css/content.css";
import "./css/xterm.css";
import "./css/xterm_customize.css";
import { Usacon } from "./usacon";
import { saveAPIKeyToBrowser } from "./credential";
import APIKey from "./api-key";

const rootId = "chrome-sacloud-console-root";
const usacon = new Usacon();

function init() {
  const root = rootElement();
  usacon.open(root);
}

function rootElement(): HTMLElement {
  let root = document.getElementById(rootId);
  if (root) {
    return root;
  }
  return createRootElement();
}

function createRootElement(): HTMLElement {
  let root = document.createElement("div");
  root.setAttribute("id", rootId);

  let parents = document.getElementsByTagName("body");
  parents[0].appendChild(root);

  return root;
}

// initialize UI elements
window.addEventListener("load", (e: Event) => {
  init();
});

// we always need credential chooser
navigator.credentials.preventSilentAccess();

// initialize message passing
chrome.runtime.onMessage.addListener((request) => {
  saveAPIKeyToBrowser(request);
});
