import { CachedLink, GetCachedItems } from "../dependencies/services/cache";
import { Publish } from "../dependencies/services/pubSub";
import TaskCache from './taskCache';

export type Status = 'ok' | 'fulfilled' | 'enough'

export class TaskContainer {
    private _serverId: string;
    private taskId: string;
    private max: number;
    private depth: number;
    private layer: number = 0;
    private count: number = 0;
    private urls: Map<string, boolean> = new Map()
    private next: string[]
    private taskCache: TaskCache | undefined;

    constructor(
        startUrl: string,
        serverId: string,
        taskId: string,
        max: number,
        depth: number
    ) {
        this.taskId = taskId;
        this.max = max;
        this.depth = depth;
        this._serverId = serverId;
        this.urls.set(startUrl, false);
        this.next = []
    }


    async initCache() {
        const taskCache = new TaskCache(this.taskId)
    }


    serverId() {
        return this._serverId;
    }

    checkStatus(): Status {
        if (this.count >= this.max) {
            return 'enough'
        }
        if (
            Array.from(this.urls)
                .filter((item: any[]) => item[1]).length === this.urls.size)
            return 'fulfilled'
        return 'ok'
    }

    updateUrls({ orgUrl, nextUrls }: { orgUrl: string, nextUrls: string[] }): Status {
        this.urls.set(orgUrl, true);
        this.next = this.next.concat(nextUrls);
        this.count += nextUrls.length;
        if(this.taskCache){
            this.taskCache.setCache(orgUrl)
        }
        return this.checkStatus()
    }


    updateLayer() {
        this.layer++;
        return this.layer < this.depth;
    }

    async nextLayer() {

        let nonCachedLinks: string[] = [...this.next]

        if (this.taskCache) {
            let counter=0
            nonCachedLinks = []
            for (let i = 0; i < this.next.length; i++) {
                if (!(await this.taskCache.checkCache(this.next[i]))) {
                    nonCachedLinks.push(this.next[i])
                }else{
                    counter++
                }
            }
            console.log(`${counter} links already in the system`);
            
        }

        this.urls = new Map(
            nonCachedLinks.map((url: string) => {
                return [url, false];
            }),
        );

        this.next = [];
    }

    async updateCache(urls: string[]) {
        if (this.taskCache) {
            for (let i = 0; i < urls.length; i++) {
                await this.taskCache.setCache(urls[i])
            }
        }
    }

    // async nextLayerController(
    //     getCachedItems: GetCachedItems
    // ) {
    //     const cachedData: CachedLink[] =
    //         await getCachedItems(this.getNeededUrls())

    //     const combinedUrls: string[] = []

    //     for (let index = 0; index < cachedData.length; index++) {
    //         combinedUrls.push(...cachedData[index].nextUrls)
    //     }


    //     let status = 'ok'
    //     for (let i = 0, ended = false; i < cachedData.length && !ended; i++) {
    //         status = this.updateUrls(cachedData[i])
    //         if (status === 'fulfilled' || status === 'enough')
    //             return { status, urls: combinedUrls }
    //     }
    //     return { status, urls: combinedUrls }

    // }

    getUrlsAsArray() {
        return Array.from(this.urls).map((item: any[]) => item[0])
    }

    getNeededUrls() {
        return Array.from(this.urls)
            .filter((item: any[]) => !item[1])
            .map((item: any[]) => item[0])
    }

    toQueue() {
        const urls = this.getUrlsAsArray()
        return {
            id: this.taskId,
            urls
        }
    }

    print() {
        console.log('-------------------------');
        console.log(`--Task ${this.taskId}--`);
        console.log(`max:${this.max}`);
        console.log(`depth:${this.depth}`);
        console.log('-------------------------');
    }
}