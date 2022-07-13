import { Client } from "../types/types";



export class Subscriber {
    private connection: Client
    private channel: string = ""

    constructor(connection: Client) {
        this.connection = connection;
    }

    getChannel() {
        return this.channel
    }

    async subscribe(channel: string, cb: (message: string) => void) {
        await this.connection.subscribe(channel, cb);
        this.channel = channel
    }

    async unSubscribe() {
        this.connection.unsubscribe(this.channel)
        this.channel = ""
    }
}