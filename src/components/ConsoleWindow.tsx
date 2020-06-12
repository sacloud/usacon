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

import React, { useEffect, useState } from "react";
import ConsoleToolBar from "./ConsoleToolBar";
import ConsoleWrapper from "./ConsoleWrapper";
import HeightResizablePane from "./HeightResizablePane";
import { Usacon } from "../usacon";
import { UsaConMessageKeys } from "../message-keys";

export type BottomDrawerProps = {
  usacon: Usacon;
};

const ConsoleWindow: React.FC<BottomDrawerProps> = (props) => {
  const [open, setOpen] = useState(false);

  const ref = React.createRef<HTMLDivElement>();
  useEffect(() => {
    const consoleRoot = ref.current;
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (
        typeof message === "object" &&
        message.type === UsaConMessageKeys.ToggleWindowVisible
      ) {
        setOpen((current) => !current);
        if (consoleRoot && !props.usacon.isOpen) {
          props.usacon.open(consoleRoot);
        }
      }
    });
  }, [props]); // We expect this to be done ONLY ONCE

  return (
    <div hidden={!open}>
      <HeightResizablePane onResize={() => props.usacon.fit()}>
        <ConsoleToolBar usacon={props.usacon} setConsoleOpen={setOpen} />
        <ConsoleWrapper ref={ref} />
      </HeightResizablePane>
    </div>
  );
};

export default ConsoleWindow;
