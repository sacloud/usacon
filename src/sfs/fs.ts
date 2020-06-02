/*
 * Inspired by: https://github.com/wasmerio/wasmer-js
 *
 * ### Original License
 * Copyright 2017 Syrus <me@syrusakbary.com>
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ###
 */

import { createFsFromVolume, IFs } from "memfs";
import {
    Volume,
    filenameToSteps,
    DirectoryJSON,
    TFilePath,
    pathToFilename
} from "memfs/lib/volume";
import { Link } from "memfs/lib/node";

import { relative } from "path";

const assert = (cond: boolean, message: string) => {
    if (!cond) {
        throw new Error(message);
    }
};

class SimpleFSDefault {
    fs: IFs;
    volume: Volume;

    constructor() {
        this.volume = new Volume();
        this.fs = createFsFromVolume(this.volume);
        this.fromJSON({
            "/dev/stdin": "",
            "/dev/stdout": "",
            "/dev/stderr": ""
        });
    }

    private _toJSON(link: Link, json: any = {}, path?: string): DirectoryJSON {
        let isEmpty = true;

        for (const name in link.children) {
            isEmpty = false;

            const child = link.getChild(name);
            if (child) {
                const node = child.getNode();
                if (node && node.isFile()) {
                    let filename = child.getPath();
                    if (path) filename = relative(path, filename);
                    json[filename] = node.getBuffer();
                } else if (node && node.isDirectory()) {
                    this._toJSON(child, json, path);
                }
            }
        }

        let dirPath = link.getPath();

        if (path) dirPath = relative(path, dirPath);

        if (dirPath && isEmpty) {
            json[dirPath] = null;
        }

        return json;
    }

    toJSON(
        paths?: TFilePath | TFilePath[],
        json: any = {},
        isRelative = false
    ): DirectoryJSON {
        const links: Link[] = [];

        if (paths) {
            if (!(paths instanceof Array)) paths = [paths];
            for (const path of paths) {
                const filename = pathToFilename(path);
                const link = this.volume.getResolvedLink(filename);
                if (!link) continue;
                links.push(link);
            }
        } else {
            links.push(this.volume.root);
        }

        if (!links.length) return json;
        for (const link of links)
            this._toJSON(link, json, isRelative ? link.getPath() : "");
        return json;
    }

    fromJSONFixed(vol: Volume, json: DirectoryJSON) {
        const sep = "/";
        for (let filename in json) {
            const data = json[filename];
            const isDir = data ? Object.getPrototypeOf(data) === null : data === null;
            if (!isDir) {
                const steps = filenameToSteps(filename);
                if (steps.length > 1) {
                    const dirname = sep + steps.slice(0, steps.length - 1).join(sep);
                    // @ts-ignore
                    vol.mkdirpBase(dirname, 0o777);
                }
                vol.writeFileSync(filename, (data as any) || "");
            } else {
                // @ts-ignore
                vol.mkdirpBase(filename, 0o777);
            }
        }
    }

    fromJSON(fsJson: any) {
        this.volume = new Volume();
        this.fromJSONFixed(this.volume, fsJson);
        // @ts-ignore
        this.fs = createFsFromVolume(this.volume);
        this.volume.releasedFds = [0, 1, 2];
        const fdErr = this.volume.openSync("/dev/stderr", "w");
        const fdOut = this.volume.openSync("/dev/stdout", "w");
        const fdIn = this.volume.openSync("/dev/stdin", "r");
        assert(fdErr === 2, `invalid handle for stderr: ${fdErr}`);
        assert(fdOut === 1, `invalid handle for stdout: ${fdOut}`);
        assert(fdIn === 0, `invalid handle for stdin: ${fdIn}`)
    }

    async getStdOut() {
        let promise = new Promise(resolve => {
            resolve(this.fs.readFileSync("/dev/stdout", "utf8"));
        });
        return promise;
    }

    async getStdErr() {
        let promise = new Promise(resolve => {
            resolve(this.fs.readFileSync("/dev/stderr", "utf8"));
        });
        return promise;
    }

}

export const SimpleFs = SimpleFSDefault;
export type SimpleFs = SimpleFSDefault;
