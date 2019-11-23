import OrderTracker from "./orderTracker";

export default class OrderTrackerFactory {

    private static instance?: OrderTracker;

    static getInstance() {
        if (typeof this.instance === "undefined") {
            this.instance = new OrderTracker();
        }

        return this.instance;
    }
}
