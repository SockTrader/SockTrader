import { EventEmitter } from "events";

const process = new EventEmitter();

module.exports = jest.fn(() => ({
    create: jest.fn(() => process),
}));

module.exports.__getProcess = jest.fn(() => process);
