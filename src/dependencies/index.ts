import { DependencyContainer } from "../expressApp/types/types"



export const loadDependencies = async () => {
    const dependencies: DependencyContainer[] = []
    try {//async stuff to get dependencies

        // dependencies.push({
        //     name:dependencyName,
        //     dependency:Dependency currently any
        // })

        return dependencies
    } catch (err) {
        throw err
    }
}

 