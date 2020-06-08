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

if (typeof global !== "undefined") {
  // global already exists
} else if (typeof window !== "undefined") {
  window.global = window;
} else if (typeof self !== "undefined") {
  self.global = self;
} else {
  throw new Error("global undefined");
}

// polyfill extentions namespaces
if (typeof global.chrome === "undefined") {
  global.chrome = {};
}

if (typeof global.chrome.runtime === "undefined") {
  global.chrome.runtime = {};
}

if (typeof global.chrome.runtime.getURL === "undefined") {
  global.chrome.runtime.getURL = function (url) {
    return "./" + url;
  };
}

if (typeof global.chrome.tabs === "undefined") {
  global.chrome.tabs = {};
}

if (typeof global.chrome.tabs.query === "undefined") {
  global.chrome.tabs.query = function (queryInfo, callback) {
    console.log(arguments);
    callback([]);
  };
}

if (typeof global.chrome.tabs.sendMessage === "undefined") {
  global.chrome.tabs.sendMessage = function () {
    console.log(arguments);
  };
}

// Credential Management API
navigator.credentials.store = function (cred) {
  return new Promise((resolve) => resolve(cred));
};

navigator.credentials.get = function () {
  return new PasswordCredential({
    name: "fake",
    id: "fake",
    password: "fake",
  });
};
