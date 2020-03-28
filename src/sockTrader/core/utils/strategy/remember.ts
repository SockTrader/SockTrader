export function remember(periods: number) {
    const generator = (function*() {
        let current = yield;
        let result = false;
        let i = 0;

        while(true) {
            result = current;

            if (i > 0 && periods !== 1) {
                result = true;
                i += 1;
                i = (i === periods) ? 0 : i;
            }
            if (current === true) i = 1;

            current = yield result;

        }
    })();

    generator.next();

    return generator;
}
