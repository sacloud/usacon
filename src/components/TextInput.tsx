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

import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";

const useStyles = makeStyles({
  inputs: {
    minWidth: "150px",
    borderRadius: 5,
    width: "380px",
  },
});

type Props = {
  type: "text" | "password";
  fieldName: string;
  placeholder?: string;
  value: string;
  error: boolean;
  helperText?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  autoComplete?: string;
};

const TextInput: React.FC<Props> = (props: Props) => {
  const classes = useStyles();
  const placeholder = props.placeholder ? props.placeholder : "";

  return (
    <TextField
      id={`${props.fieldName}-id`}
      autoComplete={props.autoComplete ? props.autoComplete : ""}
      type={props.type}
      className={classes.inputs}
      placeholder={`* ${placeholder}`}
      error={props.error}
      helperText={props.helperText}
      onChange={(e) => {
        if (props.onChange) {
          props.onChange(e);
        }
      }}
      onFocus={(event) => {
        event.target.select();
      }}
      value={props.value}
      variant="outlined"
    />
  );
};

export default TextInput;
