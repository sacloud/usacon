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

import React, { useState } from "react";
import { IconButton, Tooltip, Typography } from "@material-ui/core";
import { AccountCircle, VpnKeyRounded } from "@material-ui/icons";
import APIKey from "../api-key";
import { getAPIKey } from "../credential";
import { makeStyles } from "@material-ui/core/styles";
import { Usacon } from "../usacon";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "inline",
  },
}));

type Props = {
  usacon: Usacon;
};

const CurrentAPIKey: React.FC<Props> = (props: Props) => {
  const classes = useStyles();
  const [apiKey, setAPIKey] = useState(new APIKey());

  const handleLogin = () => {
    navigator.credentials.preventSilentAccess();
    getAPIKey(true).then((cred) => {
      if (cred !== null) {
        const newKey = new APIKey({
          token: cred.id as string,
          secret: cred.password as string,
          name: cred.name as string,
          errors: new Map<string, string>(),
        });
        props.usacon.apiKey = newKey;
        setAPIKey(newKey);
      } else {
        props.usacon.apiKey = undefined;
        setAPIKey(new APIKey());
        navigator.credentials.preventSilentAccess();
      }
    });
  };

  const handleLogout = () => {
    props.usacon.apiKey = undefined;
    setAPIKey(new APIKey());
    navigator.credentials.preventSilentAccess();
  };

  return (
    <div className={classes.root}>
      {props.usacon.apiKey ? (
        <Tooltip title="Click to logout">
          <IconButton
            aria-label="Current API key"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleLogout}
            color="primary"
          >
            <AccountCircle />
            <Typography variant="body1">{apiKey.name}</Typography>
          </IconButton>
        </Tooltip>
      ) : (
        <IconButton onClick={handleLogin} color="primary">
          <VpnKeyRounded />
          <Typography variant="body1">Choose API Key</Typography>
        </IconButton>
      )}
    </div>
  );
};

export default CurrentAPIKey;
