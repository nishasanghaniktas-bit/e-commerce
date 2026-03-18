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

type DropdownOption = {
  label: string;
  value: string;
  onSelect?: () => void;
};

type DropdownMenuProps = {
  label: string;
  options: DropdownOption[];
  buttonVariant?: "contained" | "outlined" | "text";
  size?: "small" | "medium" | "large";
};


const DropdownMenu = ({
  label,
  options,
  buttonVariant = "contained",
  size = "medium",
}: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  const handleSelect = (option: DropdownOption) => {
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
          borderRadius: 3,
          textTransform: "none",
          fontWeight: 700,
          px: 2.75,
          py: 1.35,
          letterSpacing: 0.1,
          boxShadow:
            buttonVariant === "contained"
              ? "0 12px 30px rgba(15, 23, 42, 0.12)"
              : "0 0 0 1px rgba(148, 163, 184, 0.4)",
          backgroundColor:
            buttonVariant === "contained" ? "primary.main" : "white",
          color: buttonVariant === "contained" ? "primary.contrastText" : "text.primary",
          "&:hover": {
            backgroundColor:
              buttonVariant === "contained" ? "primary.dark" : "grey.50",
            boxShadow:
              buttonVariant === "contained"
                ? "0 16px 40px rgba(15, 23, 42, 0.18)"
                : "0 0 0 1px rgba(99, 102, 241, 0.55)",
          },
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
              elevation={12}
              sx={{
                borderRadius: 3,
                minWidth: 220,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "grey.100",
                backdropFilter: "blur(6px)",
              }}
            >
              <ClickAwayListener onClickAway={close}>
                <MenuList
                  id="dropdown-menu"
                  autoFocusItem={open}
                  sx={{
                    py: 0.75,
                    bgcolor: "background.paper",
                    "& .MuiMenuItem-root": {
                      px: 2.5,
                      py: 1.15,
                      borderRadius: 2,
                      mx: 1,
                      my: 0.35,
                      fontWeight: 600,
                      color: "text.primary",
                      transition: "all 0.18s ease",
                      "&:hover": {
                        bgcolor: "primary.50",
                        color: "primary.main",
                      },
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
