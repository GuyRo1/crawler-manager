
import { Client } from '../types/types';
import { getRedisClient } from './../db/redis';
import { Subscriber } from './../models/Subscriber';

type Subscribe = (channel: string, cb: (message: string) => void) => Promise<void>
export type Publish = (channel: string, msg: string) => Promise<void>



export const createSubscriber = async () => {
    const subscriber = await getRedisClient({})
    return new Subscriber(subscriber);
}
export const createPublisher = async () => {
    try {
        const publisher = await getRedisClient({})
        return (
            async (publisher: Client, channel: string, msg: string) => 
            { await publisher.publish(channel, msg) }).bind(null,publisher)
    } catch (err) {
        console.log(err);

    }

}



