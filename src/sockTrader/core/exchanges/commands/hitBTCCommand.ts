import {ICommand} from "../../types/IConnection";

export default class HitBTCCommand implements ICommand {

    restorable = false;

    constructor(private method: string, private params: object = {}) {
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
