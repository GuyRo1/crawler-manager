import { Router } from "express";

export type RouterContainer = {
    name: string;
    router: Router;
    dependencies: string[];
}

export type DependencyType ='factory' | 'constructor' | 'service';

export type DependencyContainer = {
    name: string;
    type: DependencyType;
    dependency: any
}

export type Error = {
    status: number,
    message: string
}

