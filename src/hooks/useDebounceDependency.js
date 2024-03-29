import { useState, useEffect, useRef } from "react";
import debounce from "../util/debounce";

/**
 * Uses `setTimeout` internally.
 * @example
 * const debouncedDependency = useDebounceDependency(dependency, 100, {rising: true});
 *
 * useEffect(() => {
 *   // Your expensive code goes here.
 *   // ...
 * }, [debouncedDependency]);
 */
export default function useDebounceDependency(dependencySource, initialValue, time, options) {
  const [dependency, setDependency] = useState(initialValue);
  const setDependencyDebouncedRef = useRef(debounce(setDependency, time, options));
  useEffect(() => {
    setDependencyDebouncedRef.current(dependencySource);
  }, [dependencySource]);
  return dependency;
}
