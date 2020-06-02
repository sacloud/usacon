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

import {Runner} from "./runner";
import {Terminal} from "xterm";
import {FitAddon} from 'xterm-addon-fit';
import {WebLinksAddon} from "xterm-addon-web-links";
import {ShellAddon} from "./xterm-addon-shell/shell";
import {parse} from "shell-quote";

export class Console {
    rootElement: HTMLElement;
    term: Terminal;
    runner: Runner;
    private readonly fitAddon: FitAddon;
    private readonly webLinksAddon: WebLinksAddon;
    private readonly shellAddon: ShellAddon;


    constructor(root: HTMLElement) {
        this.rootElement = root

        const term = new Terminal({
            convertEol: true
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        const webLinksAddon = new WebLinksAddon();
        term.loadAddon(webLinksAddon);
        const shellAddon = new ShellAddon();
        term.loadAddon(shellAddon);

        this.term = term;
        this.fitAddon = fitAddon;
        this.webLinksAddon = webLinksAddon;
        this.shellAddon = shellAddon;
;
        this.runner = new Runner(this.shellAddon)

        // TODO 終了処理の一元化
        this.runner.onExit((code) => {
            if (code !== 0) {
                console.warn("exit code:", code);
            }
            this.start();
        })
    }

    fit(): void {
        this.fitAddon.fit();
    }


    async init() {
        const banner =
`==============================================================
    _   _             _____                       _      
   | | | |           /  __ \\                     | |     
   | | | |___  __ _  | /  \\/ ___  _ __  ___  ___ | | ___ 
   | | | / __|/ _\` | | |    / _ \\| '_ \\/ __|/ _ \\| |/ _ \\
   | |_| \\__ \\ (_| | | \\__/\\ (_) | | | \\__ \\ (_) | |  __/
    \\___/|___/\\__,_|  \\____/\\___/|_| |_|___/\\___/|_|\\___|
                                                    
        \x1B[4m\x1B[1;34mWeb Console for using Usacloud Web Assembly\x1B[0m
    
                 \x1B[3m\x1B[37mCopyright (C) 2017-2020 The Usacloud Authors\x1B[0m
==============================================================
`;

        this.term.open(this.rootElement);
        this.fit();
        this.term.write(banner);
        return this.runner.init();
    }

    start() {
        this.read()
            .then(line => {
                if (!this.execCommand(line)) {
                    this.start();
                }
            })
            .catch( (e) => {
                console.warn(`Error reading: ${e}`);
            });
    }

    async read(): Promise<string> {
        return this.shellAddon.read("~$ ")
    }

    private execCommand(input: string): boolean {
        // TODO 終了処理の一元化 => wasmの実行/以外の終了処理を統一するためにbooleanを返すのをやめPromiseに統一する

        let entries = parse(input);
        const first = entries.shift();
        if (first) {
            switch (first.toString()) {
                case "usacloud":
                    this.exec(entries.map(v => v.toString()));
                    return true
                case "clear":
                case "cls":
                    this.shellAddon.clearAll();
                    break;
                default:
                    this.shellAddon.println("command not found");
                    break;
            }
        }
        return false
    }

    exec(args: string[]) {
        return this.runner.exec(args)
    }

    setEnvs(envs: Map<string, string>): void {
        this.runner.setEnvs(envs);
    }
}

