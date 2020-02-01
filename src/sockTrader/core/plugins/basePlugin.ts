import Events from "../events";

export default abstract class BasePlugin {

    protected onEvent(event: string, callback: (...args: any[]) => void) {
        Events.on(event, (...args: any[]) => {
            setImmediate(() => callback(...args));
        });
    }

}
