import { NextFunction, RequestHandler,Request, Response} from "express";





export const currentRequestUrl = (req:Request, res:Response, next:NextFunction) => {
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    console.log(fullUrl);
    next()
}

