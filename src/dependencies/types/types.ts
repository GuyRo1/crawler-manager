import { createClient } from 'redis'
import { Subscriber } from './../models/Subscriber';

export type Client = ReturnType<typeof createClient>

export type Subscribe = (channel: string, cb: (message: string) => void) => Promise<void>

export type SubscriberFactory = () => Promise<Subscriber>