import { Status, TaskContainer } from './models/taskContainer';
import { Publish } from "./dependencies/services/pubSub";
import { loadDependencies } from "./dependencies/index";
import { QueueService } from "./models/rabbitmq";
import { QueueMessage } from './types/types';
import createApp from "./expressApp";
import routers from './routers'

import { ConsumeMessage, Message } from "amqplib";

import http from 'http'
import crypto from 'crypto'

import 'dotenv/config'
import { Subscriber } from './dependencies/models/Subscriber';
import { CachedLink, GetCachedItems } from './dependencies/services/cache';


const port = process.argv[2] ?? process.env.PORT ?? 3000
console.log(port);



loadDependencies()
    .then(async dependencies => {
        console.log(dependencies);
        const serverId: string = crypto.randomUUID()
        const tasks: Map<string, TaskContainer> = new Map()
        const subscriber: Subscriber = await dependencies.get('Subscriber')
        const app = createApp(routers, dependencies);
        const server: http.Server = http.createServer(app);
        server.listen(port, () => {
            console.log(`listening on port ${port}`);
        })

        const tasksQueue: QueueService = await dependencies.get('Queue');
        const workQueue: QueueService = await dependencies.get('Queue')
        const publish: Publish = await dependencies.get('Publish')
        const getCache: GetCachedItems = await dependencies.get('GetCache')

        tasksQueue.channel.assertQueue('new-tasks');
        tasksQueue.channel
            .consume('new-tasks', async (message: ConsumeMessage | null) => {
                const content = message?.content?.toString()
                if (!content) return

                const task: QueueMessage = JSON.parse(content);
                const taskContainer: TaskContainer = new TaskContainer(
                    task.url,
                    task.serverId,
                    task.id,
                    task.max,
                    task.depth,
                )

                tasks.set(task.id, taskContainer);
                workQueue.send({ ...taskContainer.toQueue(), serverId }, { getCache, publish })
                tasksQueue.channel.ack(message as Message);
            })

        console.log(`subscribed to  ${serverId}`);

        subscriber.subscribe(serverId, async (message: string) => {
            const { taskId, urls, srcUrl, }:
                {
                    serverId: string,
                    taskId: string,
                    srcUrl: string,
                    urls: string[]
                }
                = JSON.parse(message)

            const task: TaskContainer | undefined = tasks.get(taskId)

            if (!task) return

            await publish(task.serverId(), JSON.stringify({ id: taskId, urls }))
            const status: Status = task.updateUrls({ orgUrl: srcUrl, nextUrls: urls })
            switch (status) {
                case 'ok':
                    // console.log(`${task.getNeededUrls().length} links left`);
                    break;
                case 'fulfilled':
                    if (task.updateLayer()) {
                        task.nextLayer()
                        workQueue.send({ ...task.toQueue(), serverId }, { getCache, publish })
                    } else {
                        publish(`finished-${task.serverId()}`, JSON.stringify({ id: taskId }))
                        tasks.delete(taskId)
                    }
                    break;
                case 'enough': {
                    publish(`finished-${task.serverId()}`, JSON.stringify({ id: taskId }))
                    tasks.delete(taskId)
                    break;
                }
            }
        })


    })
    .catch(err => {
        console.log(err);
        process.exit(1)
    })

