import { Client } from '../types/types';
import { getRedisClient } from './../db/redis';

export type GetCachedItems = (urls: string[]) => Promise<CachedLink[]>

export type CachedLink = { orgUrl: string, nextUrls: string[] }

export const createCacheGetter = async (): Promise<GetCachedItems | undefined> => {
    try {
        const getter = await getRedisClient({})
        return (
            async (
                getter: Client,
                urls: string[]) => {
                return await getAll(getter, urls)
            })
            .bind(null, getter)
    } catch (err) {
        console.log(err);
    }
}

export type UpdateCache = (key: string, payload: string) => Promise<void>

export const createCacheUpdater = async (): Promise<UpdateCache | undefined> => {
    try {
        const updater = await getRedisClient({})
        return (
            async (updater: Client, key: string, payload: string) => {
                await updater.set(key, payload, {
                    EX: 36000    
                })
            }
        ).bind(null, updater)
    } catch (err) {
        console.log(err);
    }
}


const getAll = async (getter: Client, urls: string[]): Promise<CachedLink[]> => {
    const promises = urls.map(key =>
        (async () => {
            const value = await getter.get(key)
            return { orgUrl: key, nextUrls: JSON.parse(value ? value : '') }
        })()
    )
    const results = await Promise.allSettled(promises)
    return results
        .filter(result => result.status === 'fulfilled')
        .map((result: any) => result.value)
}


