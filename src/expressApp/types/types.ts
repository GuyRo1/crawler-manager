import { Router } from "express";
//import { Request as _Request, Response as _Response } from "express";

export type RouterContainer = {
    name: string;
    router: Router;
    dependencies: string[];
}

export type DependencyContainer = {
    name: string;
    dependency: any
}

export type Error = {
    status: number,
    message: string
}

// export interface Request extends _Request {
//     currentFullUrl: string;
// }

// export interface Response extends _Response {

// } 