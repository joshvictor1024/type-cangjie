/**
 * Uses setTimeout internally.
 * @example
 * const debouncedFunction = debounce(expensiveFunction, 100, {rising: true});
 * debouncedFunction("foo", 42);
 */
export default function debounce(f, time, options) {
  const onRisingEdge = options?.rising;
  const onFallingEdge = options?.falling;
  const wrapper = {
    timeoutId: 0,
    isWaiting: false
  };

  return function (...args) {
    if (wrapper.timeoutId === 0) {
      if (onRisingEdge) {
        f(...args);
      }
    } else {
      wrapper.isWaiting = true;
      clearTimeout(wrapper.timeoutId);
    }
    wrapper.timeoutId = setTimeout(() => {
      if (onFallingEdge && wrapper.isWaiting) {
        f(...args);
        wrapper.isWaiting = false;
      }
    }, time);
  };
}
