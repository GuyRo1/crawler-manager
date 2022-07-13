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

    constructor(startUrl: string, serverId: string, taskId: string, max: number, depth: number) {
        this.taskId = taskId;
        this.max = max;
        this.depth = depth;
        this._serverId = serverId;
        this.next = [startUrl]
        this.urls.set(startUrl, false);
    }


    serverId() {
        return this._serverId;
    }

    checkStatus(): Status {
        if (this.count >= this.max) {
            return 'enough'
        }
        if (Array.from(this.urls).filter((item: any[]) => item[1]).length === this.urls.size)
            return 'fulfilled'
        return 'ok'
    }

    updateUrls({ orgUrl, nextUrls }: { orgUrl: string, nextUrls: string[] }): Status {
        this.urls.set(orgUrl, true);
        this.next = this.next.concat(nextUrls);
        this.count += nextUrls.length;
        console.log(this.count);
        
        return this.checkStatus()
    }

    updateLayer() {
        this.layer++;
        return this.layer <= this.depth;
    }

    nextLayer() {
        this.urls = new Map(
            this.next.map((url: string) => {
                return [url, false];
            }),
        );
        this.next = [];
    }

    toQueue() {
        const urls = Array.from(this.urls).map((item: any[]) => item[0])
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