import { useState, useRef } from "react";
import {
  Button,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Box,
} from "@mui/material";

/**
 * Reusable dropdown menu built with Material UI.
 * Opens on click, closes on outside click, and supports keyboard navigation.
 */
const DropdownMenu = ({
  label,
  options,
  buttonVariant = "contained",
  size = "medium",
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  const handleSelect = (option) => {
    option.onSelect?.();
    close();
  };

  return (
    <Box display="inline-flex">
      <Button
        ref={anchorRef}
        variant={buttonVariant}
        size={size}
        onClick={toggle}
        aria-controls={open ? "dropdown-menu" : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 700,
          px: 2.5,
          py: 1.25,
          boxShadow:
            buttonVariant === "contained"
              ? "0 10px 30px rgba(0,0,0,0.08)"
              : "none",
        }}
      >
        {label}
      </Button>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
        modifiers={[
          { name: "offset", options: { offset: [0, 8] } },
          { name: "preventOverflow", options: { padding: 8 } },
        ]}
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: "left top" }}>
            <Paper
              elevation={8}
              sx={{
                borderRadius: 2,
                minWidth: 200,
                overflow: "hidden",
              }}
            >
              <ClickAwayListener onClickAway={close}>
                <MenuList
                  id="dropdown-menu"
                  autoFocusItem={open}
                  sx={{
                    py: 1,
                    "& .MuiMenuItem-root": {
                      px: 2.5,
                      py: 1.25,
                      borderRadius: 1.5,
                      mx: 1,
                      my: 0.5,
                    },
                  }}
                >
                  {options.map((option) => (
                    <MenuItem
                      key={option.value}
                      onClick={() => handleSelect(option)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") close();
                      }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
};

export default DropdownMenu;
