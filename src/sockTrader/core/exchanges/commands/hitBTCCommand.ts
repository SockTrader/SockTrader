import {Command} from "../../types/Connection";

export default class HitBTCCommand implements Command {

    restorable = false;

    constructor(private readonly method: string, private readonly params: object = {}) {
    }

    static createRestorable(method: string, params: object = {}) {
        const command = new HitBTCCommand(method, params);
        command.restorable = true;

        return command;
    }

    toCommand() {
        return {method: this.method, params: this.params, id: this.method};
    }
}
