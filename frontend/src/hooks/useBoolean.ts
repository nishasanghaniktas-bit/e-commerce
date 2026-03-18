import { useState, useCallback } from "react";

export const useBoolean = (initial = false) => {
  const [value, setValue] = useState(initial);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((prev) => !prev), []);
  return { value, setTrue, setFalse, toggle };
};

export default useBoolean;
