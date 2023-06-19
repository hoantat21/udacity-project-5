import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { encodeNextKey, getUserId, parseLimitParameter, parseNextKeyParameter } from '../utils'
import { getAllTodos } from '../../helpers/todos'


// import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
// import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    let nextKey
    let limit

    try {
      // Parse query parameters
      nextKey = parseNextKeyParameter(event)
      limit = parseLimitParameter(event) || 20
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid parameters'
        })
      }
    }

    const todos = await getAllTodos(getUserId(event), nextKey, limit)
    console.log("be " + JSON.stringify(todos))

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        "items": todos.todoItems,
        nextKey: encodeNextKey(todos.lastEvaluatedKey)
      })
    }
  })

handler.use(
  cors({
    credentials: true
  })

)
