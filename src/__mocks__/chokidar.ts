import {EventEmitter} from "events";

const chokidar: any = jest.genMockFromModule("chokidar");

const watcher: any = new EventEmitter();

chokidar.__triggerChange = () => watcher.emit("change");
chokidar.__getWatcher = () => watcher;
chokidar.watch = jest.fn(() => watcher);

module.exports = chokidar;
