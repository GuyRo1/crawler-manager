import { createClient } from 'redis';

export type Client = ReturnType<typeof createClient>

let counter =0;
const createRedisClient = async () => {
    try {
        console.log(`creating ${++counter}'s redis client`);
        
        return createClient()
    } catch (err) {
        console.log('problem with creation of redis client');

        throw err
    }
}


const connectRedisClient = async (redisClient: Client) => {
    await redisClient.connect();
}

export type GetRedisClientOptions = {
    sourceClient?: Client;
}

type GetRedisClient = (options: GetRedisClientOptions) => Promise<Client>

export const getRedisClient: GetRedisClient =
    async ({ sourceClient }: GetRedisClientOptions) => {
        const client: Client = sourceClient ? sourceClient.duplicate() : await createRedisClient()
        client.on('error',
            (err) => console.error(err));
        try {
            await connectRedisClient(client)
            return client
        } catch (err) {
            throw err
        }

    }



