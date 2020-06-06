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

export function polyfillForGolang(fs) {
  if (typeof global !== "undefined") {
    // global already exists
  } else if (typeof window !== "undefined") {
    window.global = window;
  } else if (typeof self !== "undefined") {
    self.global = self;
  } else {
    throw new Error(
      "cannot export Go (neither global, window nor self is defined)"
    );
  }

  if (!global.require && typeof require !== "undefined") {
    global.require = require;
  }

  const enosys = () => {
    const err = new Error("not implemented");
    err.code = "ENOSYS";
    return err;
  };

  if (!global.fs) {
    global.fs = fs;
  }

  if (!global.process) {
    global.process = {
      getuid() {
        return -1;
      },
      getgid() {
        return -1;
      },
      geteuid() {
        return -1;
      },
      getegid() {
        return -1;
      },
      getgroups() {
        throw enosys();
      },
      pid: -1,
      ppid: -1,
      umask() {
        throw enosys();
      },
      cwd() {
        throw enosys();
      },
      chdir() {
        throw enosys();
      },
    };
  }

  if (!global.crypto) {
    const nodeCrypto = require("crypto");
    global.crypto = {
      getRandomValues(b) {
        nodeCrypto.randomFillSync(b);
      },
    };
  }

  if (!global.performance) {
    global.performance = {
      now() {
        const [sec, nsec] = process.hrtime();
        return sec * 1000 + nsec / 1000000;
      },
    };
  }

  if (!global.TextEncoder) {
    global.TextEncoder = require("util").TextEncoder;
  }

  if (!global.TextDecoder) {
    global.TextDecoder = require("util").TextDecoder;
  }
}
