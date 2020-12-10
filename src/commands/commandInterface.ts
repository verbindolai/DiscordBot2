import {executor, ExecuteFunction, ValidateFunction} from "./executor";

export interface commandInterface {
    ex : executor
    name : string
    executeFunc : ExecuteFunction
    validateFunc : ValidateFunction
}

