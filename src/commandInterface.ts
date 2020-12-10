import {executor, ExecuteFunction, ValidateFunction} from "./commands/executor";

export interface commandInterface {
    ex : executor
    name : string
    executeFunc : ExecuteFunction
    validateFunc : ValidateFunction
}

