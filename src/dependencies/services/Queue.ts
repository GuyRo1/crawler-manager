
import rabbitMQ, { Connection, Channel, } from 'amqplib'
import { ConnectToQueue, GetChannel, CreateQueueService, SendTaskToQueue, HandleCache } from '../../models/rabbitmq'
import { QueueMessage } from '../../models/rabbitmq'
import { CachedLink } from './cache'


const connectToQueue: ConnectToQueue = async () =>
    await rabbitMQ.connect('amqp://localhost:5672')

const getQueueChannel: GetChannel = async (connection: Connection) =>
    await connection.createChannel()


const sendTaskToQueue: SendTaskToQueue = async (channel: Channel, task: QueueMessage, handleCache?: HandleCache) => {

    let nonCachedUrls = [...task.urls]
    if (handleCache) {
        const { getCache, publish } = handleCache;
        const cached: CachedLink[] = await getCache(task.urls)

        nonCachedUrls = []

        for (let index = 0; index < task.urls.length; index++) {
            const cachedLink: CachedLink | undefined =
                cached.find((cachedItem: CachedLink) => cachedItem.orgUrl === task.urls[index])
            if (cachedLink) {
                await publish(
                    task.serverId,
                    JSON.stringify({
                        serverId: task.serverId,
                        taskId: task.id,
                        srcUrl: task.urls[index],
                        urls: cachedLink.nextUrls
                    }))
            } else {
                nonCachedUrls.push(task.urls[index])
            }
        }
    }
    console.log(`sending ${nonCachedUrls.length} links to workers`);
    const work = 'work'
    await channel.assertQueue(work)
    for (let i = 0; i < nonCachedUrls.length; i++) {
        const toQueue = { id: task.id, serverId: task.serverId, url: nonCachedUrls[i] };
        channel.sendToQueue(work, Buffer.from(
            JSON.stringify(toQueue)
        ))
    }



}


export const createQueueService: CreateQueueService = async () => {
    const connection: Connection = await connectToQueue()
    const channel: Channel = await getQueueChannel(connection)
    return {
        connection: connection,
        channel: channel,
        send: (
            (channel: Channel, task: QueueMessage, handleCache?: HandleCache) => { sendTaskToQueue(channel, task, handleCache) }
        ).bind(null, channel)
    }
}




