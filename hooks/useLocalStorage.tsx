import { useEffect, useState } from "react";

function enhancedJSONParse(input: unknown) {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input !== "string") {
    return input;
  }

  const trimmed = input.trim();

  try {
    return JSON.parse(trimmed);
  } catch (e) {
    if (trimmed.toLowerCase() === "true") return true;
    if (trimmed.toLowerCase() === "false") return false;

    if (!isNaN(Number(trimmed)) && trimmed !== "") {
      const num = Number(trimmed);
      return Number.isInteger(num)
        ? parseInt(trimmed, 10)
        : parseFloat(trimmed);
    }

    if (trimmed === "") return "";

    return input;
  }
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return enhancedJSONParse(item) || initialValue;
    } catch (error) {
      console.error("Error reading localStorage key:", key, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(
        key,
        typeof valueToStore === "string"
          ? valueToStore
          : JSON.stringify(valueToStore),
      );
    } catch (error) {
      console.error("Error setting localStorage key:", key, error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(undefined);
    } catch (error) {
      console.error("Error removing localStorage key:", key, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        setStoredValue(
          event.newValue ? enhancedJSONParse(event.newValue) : initialValue,
        );
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
