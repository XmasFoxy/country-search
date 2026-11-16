export function debounce(fn, delay) {
    let timer;
    const cancel = () => {
        clearTimeout(timer);
        timer = undefined;
    };
    const delayed = (...args) => {
        cancel();
        timer = setTimeout(() => {
            timer = undefined;
            fn(...args);
        }, delay);
    };
    delayed.cancel = cancel;
    return delayed;
}
