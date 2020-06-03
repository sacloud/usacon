// The class for Go Wasm Commands
import {WasmFs} from "@wasmer/wasmfs";

import Command from "./command";
import CommandOptions from "./command-options";
import {polyfillForGolang} from "./go/polyfill";
import Go from "./go/go";

export default class GoWasmCommand extends Command {
    constructor(options: CommandOptions) {
        super(options);

        if (!options.module) {
            throw new Error("Did not find a WebAssembly.Module");
        }

    }

    async run(wasmFs: WasmFs) {
        polyfillForGolang(wasmFs.fs);
        const go = new Go();

        const options = {
            env: this.options.env,
            args: this.options.args,
        };

        let wasmModule = this.options.module as WebAssembly.Module;
        let instance = await WebAssembly.instantiate(wasmModule, go.importObject);

        this.options.args[0] = "js";
        go.argv = this.options.args;

        // TODO 開発中はFakeモードをデフォルトONにしておく
        const fakes = {SAKURACLOUD_FAKE_MODE: "1"}
        go.env = {...fakes, ...(this.options.env || {})};
        return go.run(instance);
    }
}
