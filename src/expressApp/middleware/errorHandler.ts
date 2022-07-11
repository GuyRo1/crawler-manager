
import { NextFunction,Request, Response} from "express";
import {Error} from '../types/types'



export const errorHandler = (err:Error, req:Request, res:Response, next:NextFunction) => {
    const status = err.status || 500
    const message = err.message || "server ERROR"
    res.status(status).send({ message })
}
