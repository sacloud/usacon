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

// The Wasm Terminal
// @ts-ignore
import xterm, * as xtermDefault from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import WasmTerminalConfig from "./wasm-terminal-config";
import WasmTty from "./wasm-tty/wasm-tty";
import WasmShell from "./wasm-shell/wasm-shell";
import {
  disposeObserver,
  newResizeObserver,
  observeElement,
} from "./resize-observer";

const Terminal = xtermDefault.Terminal || xterm.Terminal;
// import { WebglAddon } from 'xterm-addon-webgl';

const MOBILE_KEYBOARD_EVENTS = ["click", "tap"];

export default class WasmTerminal {
  xterm: any;
  container: HTMLElement | undefined;
  webLinksAddon: WebLinksAddon;
  fitAddon: FitAddon;

  wasmTerminalConfig: WasmTerminalConfig;
  wasmTty: WasmTty;
  wasmShell: WasmShell;

  initializer?: () => Promise<void>;
  pasteEvent: any;
  resizeEvent: any;
  dataEvent: any;

  isOpen: boolean;
  pendingPrintOnOpen: string;

  resizeObserver: any;

  constructor(config: any) {
    this.wasmTerminalConfig = new WasmTerminalConfig(config);

    // Create our xterm element
    this.xterm = new Terminal({
      // rendererType: 'dom'
    });
    // tslint:disable-next-line
    // this.pasteEvent = this.xterm.on("paste", this.onPaste);
    // tslint:disable-next-line
    this.resizeEvent = this.xterm.onResize(this.handleTermResize);
    this.xterm.onKey((keyEvent: { key: string; domEvent: KeyboardEvent }) => {
      // Fix for iOS Keyboard Jumping on space
      if (keyEvent.key === " ") {
        keyEvent.domEvent.preventDefault();
        // keyEvent.domEvent.stopPropagation();
        return false;
      }
    });

    // Set up our container
    this.container = undefined;

    // Load our addons
    this.webLinksAddon = new WebLinksAddon();
    this.fitAddon = new FitAddon();
    this.xterm.loadAddon(this.fitAddon);
    this.xterm.loadAddon(this.webLinksAddon);

    this.wasmTerminalConfig = new WasmTerminalConfig(config);

    // Create our Shell and tty
    this.wasmTty = new WasmTty(this.xterm);
    this.wasmShell = new WasmShell(this.wasmTerminalConfig, this.wasmTty);
    // tslint:disable-next-line
    this.dataEvent = this.xterm.onData(this.wasmShell.handleTermData);

    this.isOpen = false;
    this.pendingPrintOnOpen = "";
    this.initializer = undefined;

    this.resizeObserver = newResizeObserver(() => {
      if (this.xterm.isOpen) {
        this.fit();
      }
    });
  }

  open(container: HTMLElement) {
    if (this.xterm.isOpen) {
      return;
    }
    // Remove any current event listeners
    const focusHandler = this.focus.bind(this);
    if (this.container !== undefined) {
      MOBILE_KEYBOARD_EVENTS.forEach((eventName) => {
        // @ts-ignore
        this.container.removeEventListener(eventName, focusHandler);
      });
    }

    observeElement(this.resizeObserver, container);

    this.container = container;
    this.xterm.open(container);
    // this.xterm.loadAddon(new WebglAddon());

    const initFunc = () => {
      this.isOpen = true;
      setTimeout(() => {
        // Fix for Mobile Browsers and their virtual keyboards
        if (this.container !== undefined) {
          MOBILE_KEYBOARD_EVENTS.forEach((eventName) => {
            // @ts-ignore
            this.container.addEventListener(eventName, focusHandler);
          });
        }

        if (this.pendingPrintOnOpen) {
          this.wasmTty.print(this.pendingPrintOnOpen + "\n");
          this.pendingPrintOnOpen = "";
        }

        // tslint:disable-next-line
        this.wasmShell.prompt();
      });
    };

    if (this.initializer) {
      this.wasmTty.print("initializing...\n");
      this.initializer()
        .then(() => {
          this.wasmTty.clearTty();
          initFunc();
        })
        .catch((e) => {
          this.wasmTty.clearTty();
          this.wasmTty.print(`initialize error: ${e.toString()}\n`);
        });
    } else {
      initFunc();
    }
  }

  fit() {
    this.fitAddon.fit();
  }

  focus() {
    // this.xterm.blur();
    this.xterm.focus();
    // this.xterm.scrollToBottom();

    // To fix iOS keyboard, scroll to the cursor in the terminal
    this.scrollToCursor();
  }

  scrollToCursor() {
    if (!this.container) {
      return;
    }

    // We don't need cursorX, since we want to start at the beginning of the terminal.
    const cursorY = this.wasmTty.getBuffer().cursorY;
    const size = this.wasmTty.getSize();

    const containerBoundingClientRect = this.container.getBoundingClientRect();

    // Find how much to scroll because of our cursor
    const cursorOffsetY =
      (cursorY / size.rows) * containerBoundingClientRect.height;

    let scrollX = containerBoundingClientRect.left;
    let scrollY = containerBoundingClientRect.top + cursorOffsetY + 10;

    if (scrollX < 0) {
      scrollX = 0;
    }
    if (scrollY > document.body.scrollHeight) {
      scrollY = document.body.scrollHeight;
    }

    window.scrollTo(scrollX, scrollY);
  }

  print(message: string, sync?: boolean) {
    // For some reason, double new lines are not respected. Thus, fixing that here
    message = message.replace(/\n\n/g, "\n \n");

    if (!this.isOpen) {
      if (this.pendingPrintOnOpen) {
        this.pendingPrintOnOpen += message;
      } else {
        this.pendingPrintOnOpen = message;
      }
      return;
    }

    if (this.wasmShell.isPrompting()) {
      // Cancel the current prompt and restart
      this.wasmShell.printAndRestartPrompt(() => {
        this.wasmTty.print(message + "\n", sync);
        return undefined;
      });
      return;
    }

    this.wasmTty.print(message, sync);
  }

  runCommand(line: string) {
    if (this.wasmShell.isPrompting()) {
      this.wasmTty.setInput(line);
      this.wasmShell.handleReadComplete();
    }
  }

  destroy() {
    if (this.container) {
      disposeObserver(this.resizeObserver, this.container);
    }
    this.xterm.dispose();
    delete this.xterm;
  }

  onPaste(data: string) {
    this.wasmTty.print(data);
  }

  /**
   * Handle terminal resize
   *
   * This function clears the prompt using the previous configuration,
   * updates the cached terminal size information and then re-renders the
   * input. This leads (most of the times) into a better formatted input.
   */
  handleTermResize = (data: { rows: number; cols: number }) => {
    const { rows, cols } = data;
    this.wasmTty.clearInput();
    this.wasmTty.setTermSize(cols, rows);
    this.wasmTty.setInput(this.wasmTty.getInput(), true);
  };
}
