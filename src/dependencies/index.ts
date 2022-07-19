import { createQueueService } from './services/Queue';
import { createCacheGetter, createCacheUpdater } from './services/cache'
import { createSubscriber, createPublisher } from './services/pubSub';
import { DependenciesContainer } from "./models/classes";

export const loadDependencies = async () => {
    try {
        return new DependenciesContainer([
            {
                name: 'Queue',
                type: 'factory',
                dependency: createQueueService
            },
            {
                name: 'Subscriber',
                type: 'factory',
                dependency: createSubscriber
            },
            {
                name: 'Publish',
                type: 'factory',
                dependency: createPublisher
            },
            {
                name: 'GetCache',
                type: 'factory',
                dependency: createCacheGetter
            },
            {
                name: 'SetCache',
                type: 'factory',
                dependency: createCacheUpdater
            }
        ])
    } catch (err) {
        throw err
    }
}

