/**
 * Copyright 2020 The UsaCon Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// listener: initialize page action
import { UsaConMessageKeys } from "./message-keys";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (
    sender.tab &&
    sender.tab.id &&
    typeof message === "object" &&
    message.type === UsaConMessageKeys.ShowPageAction
  ) {
    chrome.pageAction.show(sender.tab.id);
  }
  return true;
});

// listener: on click for page action icon
chrome.pageAction.onClicked.addListener((tab) => {
  if (tab && tab.id && tab.status === "complete") {
    chrome.tabs.sendMessage(tab.id, {
      type: UsaConMessageKeys.ToggleWindowVisible,
    });
  }
});

// set response header modifier for set COOP/COEP header
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (!details.responseHeaders) {
      return;
    }
    details.responseHeaders.push({
      name: "Cross-Origin-Embedder-Policy",
      value: "require-corp",
    });
    details.responseHeaders.push({
      name: "Cross-Origin-Opener-Policy",
      value: "same-origin",
    });
    return { responseHeaders: details.responseHeaders };
  },
  { urls: ["https://secure.sakura.ad.jp/cloud/iaas/"] },
  ["blocking", "responseHeaders", "extraHeaders"]
);

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (!details.responseHeaders) {
      return;
    }
    const header = details.responseHeaders.find(
      (h) => h.name.toLowerCase() === "cross-origin-resource-policy"
    );
    if (header) {
      header.value = "cross-origin";
    } else {
      details.responseHeaders.push({
        name: "Cross-Origin-Resource-Policy",
        value: "cross-origin",
      });
    }
    return { responseHeaders: details.responseHeaders };
  },
  { urls: ["https://s.yimg.jp/*", "https://munchkin.marketo.net/*"] },
  ["blocking", "responseHeaders", "extraHeaders"]
);
