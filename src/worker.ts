import * as processWorker from "./console/workers/process.worker";
import { WASI } from "@wasmer/wasi";
import BrowserWASIBindings from "@wasmer/wasi/lib/bindings/browser";

WASI.defaultBindings = BrowserWASIBindings;

export default processWorker;
