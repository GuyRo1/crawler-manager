import { Channel, Connection } from 'amqplib'
import { GetCachedItems } from '../dependencies/services/cache'
import { Publish } from '../dependencies/services/pubSub'


export type ConnectToQueue = () => Promise<Connection>

export type GetChannel = (connection: Connection) => Promise<Channel>

export type HandleCache = { getCache: GetCachedItems, publish: Publish }

export type SendTaskToQueue = (channel: Channel, task: QueueMessage, handleCache?: HandleCache) => Promise<void>

export type QueueMessage = {
    id: string,
    serverId: string,
    urls: string[],
}

type Send = (task: QueueMessage, handleCache?: HandleCache) => void

export type QueueService = {
    connection: Connection,
    channel: Channel,
    send: Send
}

export type CreateQueueService = () => Promise<QueueService>

//export type Send = (task:QueueMessage)=>void