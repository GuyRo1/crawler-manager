import { Client } from "../dependencies/types/types";
import { getRedisClient } from './../dependencies/db/redis';




class TaskCache {
    private static client: Client | undefined;
    private id: string;

    constructor(id: string) {
        this.id = id;
    }



    async init() {
        if (!TaskCache.client)
            TaskCache.client = await getRedisClient({})
        if (TaskCache.client)
            TaskCache.client.set(this.id, '')
    }


    async checkCache(url: string) {
        if (TaskCache.client) {
            return await TaskCache.client.sIsMember(this.id, url)
        }
        return false

    }

    async setCache(url: string) {
        if (TaskCache.client) {
            await TaskCache.client.sAdd(this.id, url)
        }
    }
}

export default TaskCache