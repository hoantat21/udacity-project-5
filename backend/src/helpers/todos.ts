// import { TodosAccess } from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
// import { TodoItem } from '../models/TodoItem'
import { getUserId } from '../lambda/utils'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import { Key } from 'aws-sdk/clients/dynamodb'
import * as uuid from 'uuid'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { TodoItem, PageableTodoItems } from '../models/TodoItem'
import { getDownloadUrl, getUploadUrl } from './attachmentUtils'
import { getAllTodosImpl, getTodoById, updateAttachment } from './todosAcess'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic
export function todoBuilder(todoRequest: CreateTodoRequest, event: APIGatewayProxyEvent): TodoItem {
    const todoId = uuid.v4()
    const todo = {
        todoId: todoId,
        userId: getUserId(event),
        createdAt: new Date().toISOString(),
        name: todoRequest.name,
        dueDate: todoRequest.dueDate,
        done: false,
        attachmentUrl: ''
    }
    return todo as TodoItem
}

export async function getAllTodos(userId: string, nextKey: Key, limit: number): Promise<PageableTodoItems> {
    const items = await getAllTodosImpl(userId, nextKey, limit)

    for (let item of items.todoItems) {
        if (!!item['attachmentUrl'])
            item['attachmentUrl'] = getDownloadUrl(item['attachmentUrl'])
    }

    return items
}


export async function attachTodo(userId:string, todoId: string): Promise<string> {
    const validTodo = await getTodoById(todoId)

    if (!validTodo) {
        throw new Error('404')
    }

    const url = getUploadUrl(todoId)
    await updateAttachment(userId, todoId)
    return url
}
