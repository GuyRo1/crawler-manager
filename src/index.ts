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


const port = process.env.PORT ?? 3000

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
        tasksQueue.channel.assertQueue('new-tasks');
        tasksQueue.channel.consume('new-tasks', async (message: ConsumeMessage | null) => {
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
            tasks.get(task.id)?.print()
            workQueue.send({ ...taskContainer.toQueue(), serverId })
            tasksQueue.channel.ack(message as Message);
        })
        console.log(`subscribed to  ${serverId}`);

        subscriber.subscribe(serverId, (message: string) => {

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
            console.log(`publishing to ${task.serverId()}`);
            publish(task.serverId(), JSON.stringify({ id: taskId, urls }))

            const status: Status = task.updateUrls({ orgUrl: srcUrl, nextUrls: urls })
            console.log(status);
            
            switch (status) {
                case 'ok':
                    break;
                case 'fulfilled':
                    if (task.updateLayer()) {
                        task.nextLayer()
                        workQueue.send({ ...task.toQueue(), serverId })
                    } else {
                        tasks.delete(taskId)
                    }
                case 'enough': {
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

