import { DependencyContainer } from "../expressApp/types/types"
import { createQueueService } from './services/Queue';
import { createSubscriber, createPublisher } from './services/pubSub';
import { DependenciesContainer } from "./models/classes";




export const loadDependencies = async () => {
    const dependencies: DependencyContainer[] = []
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
            }
        ])
    } catch (err) {
        throw err
    }
}

