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

import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  AppBar,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@material-ui/core";
import CancelRoundedIcon from "@material-ui/icons/CancelRounded";
import APIKeyDialog from "./APIKeyDialog";
import { Usacon } from "../usacon";
import CurrentAPIKey from "./CurrentAPIKey";
import { AddCircleRounded } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  toolBar: {
    minHeight: 48,
    paddingRight: 5,
  },
  logo: {
    maxHeight: 40,
  },
  icons: {
    marginLeft: "auto",
  },
}));

export type ConsoleToolbarProps = {
  usacon: Usacon;
  setConsoleOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const ConsoleToolBar: React.FC<ConsoleToolbarProps> = (props) => {
  const classes = useStyles();
  const [apiKeyInputOpen, setAPIKeyInputOpen] = React.useState(false);

  const handleAPIKeyButtonClick = () => {
    navigator.credentials.preventSilentAccess();
    setAPIKeyInputOpen(true);
  };

  const handleAPIKeyInputClose = () => {
    setAPIKeyInputOpen(false);
  };

  const handleCloseButtonClick = () => {
    props.setConsoleOpen(false);
  };

  return (
    <AppBar color={"default"} position={"relative"}>
      <Toolbar className={classes.toolBar}>
        <img
          src={chrome.runtime.getURL("usacloud-horizontal.svg")}
          className={classes.logo}
        />
        <div className={classes.icons}>
          <CurrentAPIKey usacon={props.usacon} />
          <Tooltip title="Add API Key">
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleAPIKeyButtonClick}
            >
              <AddCircleRounded />
              <Typography variant="body1">Add API Key</Typography>
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton
              edge="start"
              color="default"
              onClick={handleCloseButtonClick}
            >
              <CancelRoundedIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Toolbar>
      <APIKeyDialog open={apiKeyInputOpen} onClose={handleAPIKeyInputClose} />
    </AppBar>
  );
};

export default ConsoleToolBar;
