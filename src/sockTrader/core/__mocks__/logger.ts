const logger = {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    input: jest.fn(),
};

export const orderbookLogger = {...logger};
export const walletLogger = {...logger};
export const candleLogger = {...logger};
export const orderLogger = {...logger};

export default {...logger};
