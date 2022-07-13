export interface QueueMessage {
    serverId:string,
    id: string,
    url: string;
    depth: number;
    max: number;
}