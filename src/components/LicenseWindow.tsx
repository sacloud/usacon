import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import licenses from "../licenses";

export type LicenseWindowProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
};

const LicenseWindow: React.FC<LicenseWindowProps> = (props) => {
  const handleClose = () => {
    props.setOpen(false);
    props.onClose?.();
  };
  return (
    <Dialog
      open={props.open}
      onClose={() => props.onClose?.()}
      onBackdropClick={() => props.onClose?.()}
      scroll="paper"
      fullWidth={true}
      maxWidth="lg"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Open source licenses</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <pre>{licenses}</pre>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LicenseWindow;
