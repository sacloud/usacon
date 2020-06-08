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

import {
  createMuiTheme,
  makeStyles,
  MuiThemeProvider,
} from "@material-ui/core/styles";
import { APIKey } from "../api-key";
import { red } from "@material-ui/core/colors";
import TextInput from "./TextInput";
import { Button, Grid, Typography } from "@material-ui/core";

const theme = createMuiTheme({
  palette: {
    type: "light",
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    width: "400px",
  },
  error: {
    border: "2px solid red",
    borderRadius: 5,
    backgroundColor: red[50],
  },
}));

const Popup = () => {
  const classes = useStyles();
  const [apiKey, updateAPIKey] = useState(new APIKey());

  const onSaveButtonClick = () => {
    apiKey.validate();
    updateAPIKey(new APIKey(apiKey));
    if (apiKey.errors.size === 0) {
      // TODO send message
      console.log("TODO send message to the Content Scripts");
    }
  };

  return (
    <MuiThemeProvider theme={theme}>
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body1">UsaCon API Key Settings</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextInput
              fieldName={"token"}
              type={"text"}
              value={apiKey.token}
              placeholder={"API Token"}
              error={apiKey.errors.has("token")}
              helperText={apiKey.errors.get("token")}
              onChange={(e) => {
                apiKey.token = e.target.value;
                updateAPIKey(new APIKey(apiKey));
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextInput
              fieldName={"sexret"}
              type={"text"}
              value={apiKey.secret}
              placeholder={"API Secret"}
              error={apiKey.errors.has("secret")}
              helperText={apiKey.errors.get("secret")}
              onChange={(e) => {
                apiKey.secret = e.target.value;
                updateAPIKey(new APIKey(apiKey));
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={onSaveButtonClick}
            >
              Save to the Browser
            </Button>
          </Grid>
        </Grid>
      </div>
    </MuiThemeProvider>
  );
};

export default Popup;
