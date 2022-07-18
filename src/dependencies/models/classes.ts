import { DependencyContainer, DependencyType } from "../../expressApp/types/types"


const chooseGetter = (dependency: DependencyContainer) => {
    if (!dependency.type || !dependency.dependency || dependency.name)

        return (((dependency: DependencyContainer) => {
            return null
        }).bind(null, dependency))

    switch (dependency.type) {
        case 'constructor':
            return ((dependency: DependencyContainer) => {
                return new dependency.dependency()
            }).bind(null, dependency);
        case 'factory':
            return ((dependency: DependencyContainer) => {
                return dependency.dependency()
            }).bind(null, dependency);
        case 'service':
        default:
            return ((dependency: DependencyContainer) => {
                return dependency.dependency
            }).bind(null, dependency);
    }
}


export class UseDependency {
    private dependency: DependencyContainer
    public get: () => any

    constructor(dependency: DependencyContainer) {
        this.dependency = dependency
        this.get = chooseGetter(dependency)
    }
}



export class DependenciesContainer {
    private dependencies: DependencyContainer[]

    constructor(dependencies: DependencyContainer[]) {
        this.dependencies = dependencies
    }

    getAll() {
        return this.dependencies
    }

    async get(dependency: string) {

        const dep: DependencyContainer | undefined =
            this.dependencies.find(item => item.name === dependency)

        if (!dep) return undefined

        switch (dep.type) {
            case 'constructor':
                return new dep.dependency()
            case 'factory':
                return await dep.dependency()
            case 'service':
                return dep.dependency
            default:
                return undefined;
        }
    }
}