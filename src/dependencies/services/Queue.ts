
import rabbitMQ, { Connection, Channel, } from 'amqplib'
import { ConnectToQueue, GetChannel, CreateQueueService, SendTaskToQueue } from '../../models/rabbitmq'
import { QueueMessage } from '../../models/rabbitmq'



const connectToQueue: ConnectToQueue = async () =>
    await rabbitMQ.connect('amqp://localhost:5672')

const getQueueChannel: GetChannel = async (connection: Connection) =>
    await connection.createChannel()

const sendTaskToQueue: SendTaskToQueue = async (channel: Channel, task: QueueMessage) => {
    const work = 'work'
    await channel.assertQueue(work)
    for (let i = 0; i < task.urls.length; i++) {
        const toQueue = { id: task.id, serverId: task.serverId, url: task.urls[i] };
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
            (channel: Channel, task: QueueMessage) => { sendTaskToQueue(channel, task) }
        ).bind(null, channel)
    }
}




