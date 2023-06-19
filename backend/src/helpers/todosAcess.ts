import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient, Key } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
// import { TodoItem } from '../models/TodoItem'
// // import { TodoUpdate } from '../models/TodoUpdate';

import { PageableTodoItems, TodoItem } from "../models/TodoItem"
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('todos')

// const logger = createLogger('TodosAccess')
const todosTable = process.env.TODOS_TABLE
const index = process.env.TODOS_CREATED_AT_INDEX
const docClient: DocumentClient = createDynamoDBClient()


// // TODO: Implement the dataLayer logic
export async function createTodo(todo: TodoItem): Promise<TodoItem> {
  await docClient.put({
    TableName: todosTable,
    Item: todo
  }).promise()

  return todo
}

export async function getAllTodosByUserId(userId: string): Promise<TodoItem[]> {
  const result = await docClient.query({
    TableName: todosTable,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  }).promise()
  console.log("log " + JSON.stringify(result.Items))
  return result.Items as TodoItem[]

}

export async function getAllTodosImpl(userId: string, nextKey: Key, limit: number): Promise < PageableTodoItems > {
  const result = await docClient.query({
    TableName: todosTable,
    IndexName: index,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ScanIndexForward: false,
    Limit: limit,
    ExclusiveStartKey: nextKey
  }).promise()

  const items = result.Items as TodoItem[]
  return { todoItems: items, lastEvaluatedKey: result.LastEvaluatedKey }
}

export async function getTodoById(todoId: string): Promise<TodoItem> {
  const result = await docClient.query({
    TableName: todosTable,
    IndexName: index,
    KeyConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
      ':todoId': todoId
    }
  }).promise()
  console.log("taolog " + JSON.stringify(result.Items))
  if (result.Items.length !== 0) return result.Items[0] as TodoItem
  return null
}


export async function updateAttachmentTodo(todoId: string, userId: string, attachmentUrl: string): Promise<TodoItem> {
  const result = await docClient.update({
    TableName: todosTable,
    Key: {
      todoId: todoId,
      userId: userId
    },
    UpdateExpression: 'set attachmentUrl = :attachmentUrl',
    ExpressionAttributeValues: {
      ':attachmentUrl': attachmentUrl
    }
  }).promise()
  return result.Attributes as TodoItem
}

export async function updateTodo(todoId: string, userId: string, model: TodoUpdate): Promise<TodoItem> {
  console.log('Update todo');

  const params = {
    TableName: todosTable,
    Key: {
      todoId: todoId,
      userId: userId
    },
    UpdateExpression: "set #todoName = :todoName, dueDate = :dueDate, done = :done",
    ExpressionAttributeNames: { '#todoName': "name" },
    ExpressionAttributeValues: {
      ":todoName": model.name,
      ":dueDate": model.dueDate,
      ":done": model.done
    },
    ReturnValues: "ALL_NEW"
  };

  const result = await docClient.update(params).promise();

  return result.Attributes as TodoItem;
}

export async function deleteTodo(todoId: string, userId: string): Promise<any> {
  logger.info('delete TODO item', userId, todoId)
  const params = {
    TableName: todosTable,
    Key: {
      todoId: todoId,
      userId: userId
    },
  }
  return await docClient.delete(params).promise();
}


export async function updateAttachment(userId: string, todoId: string): Promise<void> {
  await docClient.update({
    TableName: todosTable,
    Key: { userId, todoId },
    UpdateExpression: "set attachmentUrl=:a",
    ExpressionAttributeValues: {
      ":a": todoId
    },
    ReturnValues: "NONE"
  }).promise()
}


function createDynamoDBClient() {
  return new XAWS.DynamoDB.DocumentClient()
}