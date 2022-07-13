import { createClient } from 'redis';

export type Client = ReturnType<typeof createClient>

const createRedisClient = async () =>
    createClient()

const connectRedisClient = async (redisClient: Client) => {
    await redisClient.connect();
}

export type GetRedisClientOptions = {
    sourceClient?: Client;
}

type GetRedisClient = (options: GetRedisClientOptions) => Promise<Client>

export const getRedisClient: GetRedisClient = async ({ sourceClient }: GetRedisClientOptions) => {
    const client: Client = sourceClient ? sourceClient.duplicate() : await createRedisClient()
    client.on('error',
        (err) => console.error(err));
    await connectRedisClient(client)
    return client
}



