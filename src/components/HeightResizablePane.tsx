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

import React, { useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Drawer } from "@material-ui/core";

const defaultDrawerHeight = 500;
const minDrawerHeight = 50;
const maxDrawerHeight = 800;

const useStyles = makeStyles((theme) => ({
  drawer: {
    flexShrink: 0,
    zIndex: 100,
    overflowY: "hidden",
  },
  dragger: {
    overflowY: "hidden",
    width: "100%",
    cursor: "row-resize",
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    height: 1,
    zIndex: 1110,
  },
}));

export type Props = {
  onResize?: (newHeight: number) => void;
};

const HeightResizablePane: React.FC<Props> = (props) => {
  const classes = useStyles();
  const [drawerHeight, setDrawerHeight] = React.useState(defaultDrawerHeight);

  const handleMouseDown = () => {
    document.addEventListener("mouseup", handleMouseUp, true);
    document.addEventListener("mousemove", handleMouseMove, true);
    document.body.style.userSelect = "none";
  };

  const handleMouseUp = () => {
    document.removeEventListener("mouseup", handleMouseUp, true);
    document.removeEventListener("mousemove", handleMouseMove, true);
    document.body.style.userSelect = "inherit";
  };

  const handleMouseMove = useCallback((e) => {
    const newHeight = window.innerHeight - e.clientY;
    if (newHeight > minDrawerHeight && newHeight < maxDrawerHeight) {
      setDrawerHeight(newHeight);
      if (props.onResize) {
        props.onResize(newHeight);
      }
    }
  }, []);

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      PaperProps={{ style: { height: drawerHeight, overflowY: "hidden" } }}
      anchor={"bottom"}
    >
      <div onMouseDown={(e) => handleMouseDown()} className={classes.dragger} />
      {props.children}
    </Drawer>
  );
};

export default HeightResizablePane;
