import { useMemo } from "react";
import {
  Box,
  Button,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from "@mui/material";
import { useBoolean } from "../hooks/useBoolean";

export type Option = { label: string; value: string };

type SelectDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
};

/**
 * Drop-in replacement for native selects using MUI menu primitives.
 * Keeps content unchanged while upgrading interactions + styling.
 */
export default function SelectDropdown({
  value,
  onChange,
  options,
  placeholder = "Select",
  className,
  buttonClassName,
}: SelectDropdownProps) {
  const { value: open, toggle, setFalse } = useBoolean(false);
  const anchorId = useMemo(
    () => `select-dropdown-${Math.random().toString(36).slice(2, 7)}`,
    []
  );
  const selectedLabel =
    options?.find((opt) => opt.value === value)?.label || placeholder;

  return (
    <Box className={className} position="relative" display="inline-flex">
      <Button
        id={anchorId}
        variant="outlined"
        color="inherit"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        fullWidth
        className={buttonClassName}
        sx={{
          justifyContent: "space-between",
          borderRadius: 3,
          textTransform: "none",
          fontWeight: 700,
          px: 3,
          py: 1.6,
          borderColor: "rgba(148,163,184,0.6)",
          bgcolor: "white",
          boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          "&:hover": { borderColor: "primary.main", bgcolor: "grey.50" },
        }}
      >
        {selectedLabel}
        <span style={{ opacity: 0.5, fontSize: 12 }}>▼</span>
      </Button>

      <Popper
        open={open}
        anchorEl={document.getElementById(anchorId)}
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
              }}
            >
              <ClickAwayListener onClickAway={setFalse}>
                <MenuList
                  autoFocusItem={open}
                  sx={{
                    py: 0.5,
                    "& .MuiMenuItem-root": {
                      px: 2.75,
                      py: 1.2,
                      borderRadius: 2,
                      mx: 1,
                      my: 0.25,
                      fontWeight: 600,
                      transition: "all 0.15s ease",
                    },
                  }}
                >
                  {options.map((option) => (
                    <MenuItem
                      key={option.value}
                      selected={option.value === value}
                      onClick={() => {
                        onChange(option.value);
                        setFalse();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") setFalse();
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
}
