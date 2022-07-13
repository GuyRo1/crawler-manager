import express from 'express'
import cors from 'cors'
import { DependencyContainer, RouterContainer } from './types/types'
import { Express } from 'express'
import { healthCheck } from './middleware/healthCheck';
import { errorHandler } from './middleware/errorHandler';
import { currentRequestUrl } from './middleware/currentRequestUrl';
import { DependenciesContainer } from '../dependencies/models/classes';



export const createApp = (routers: RouterContainer[], dependencies: DependenciesContainer): Express => {
    const app = express();
    app.use(cors());
    app.use(express.json())
    app.use(currentRequestUrl)
    mountDependencies(app, dependencies.getAll())
    const log: string[] = mountRouters(app, routers)
    if (log.length !== 0) throw { log }
    app.use(healthCheck)
    app.use(errorHandler)
    return app
}

const mountRouters = (app: Express, routers: RouterContainer[]): string[] => {
    const log: string[] = []
    routers.forEach((router, index) => {
        if (!router.name) {
            log.push(`router ${index} got no name `)
            return
        }
        if (!router.router) {
            log.push(`router ${index},${router.name} ,does not exist `)
            return
        }
        if (!!router.dependencies) {
            const approved = true
            if (router.dependencies.filter(
                dependency => !app.get(dependency)
            ).length === 0) {
                app.use(`/${router.name}`, router.router)
            } else {
                log.push(`${router.name} is missing dependencies`)
                return log
            }
        }
    });
    return log
}

const mountDependencies = (app: Express, dependencies: DependencyContainer[]) => {
    dependencies.forEach(dependency => {
        if (!!dependency.name && !!dependency.dependency) {
            app.set(dependency.name, dependency.dependency)
        }
    })
}
