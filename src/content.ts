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

import React from "react";
import ReactDOM from "react-dom";
import "./css/xterm.css";
import "./css/xterm_customize.css";
import { Usacon } from "./usacon";
import ConsoleWindow from "./components/ConsoleWindow";
import { UsaConMessageKeys } from "./message-keys";

const rootId = "chrome-sacloud-console-root";

function initialize() {
  // create element for rendering the UsaCon window
  let root = document.createElement("div");
  root.setAttribute("id", rootId);

  let parents = document.getElementsByTagName("body");
  parents[0].appendChild(root);

  ReactDOM.render(
    React.createElement(ConsoleWindow, { usacon: new Usacon() }, null),
    document.getElementById(rootId)
  );
}

// initialize UI elements
initialize();

// initialize message handling between the content script and the background script.
chrome.runtime.sendMessage({ type: UsaConMessageKeys.ShowPageAction }); // start page action(enable browser extension icon)
