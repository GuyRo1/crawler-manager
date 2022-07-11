import { loadDependencies } from "./dependencies/index";
import createApp from "./expressApp";
import routers from './routers'

import  http from 'http'

import 'dotenv/config'

const port = process.env.PORT ?? 3000

loadDependencies()
    .then(dependencies => {
        const app = createApp(routers, dependencies)
        const server: http.Server = http.createServer(app)
        server.listen(port, () => {
            console.log(`listening on port ${port}`);
        })
    })
    .catch(err => {
        console.log(err);
        process.exit(1)
    })

// try {
//     const dependencies = await loadDependencies()
//     const app = createApp(routers, dependencies)
//     const server: http.Server = http.createServer(app)
//     server.listen(port, () => {
//         console.log(`listening on port ${port}`);
//     })
// } catch (err) {
//     console.log(err);
//     process.exit(1)
// }