import { createStore, applyMiddleware } from 'redux'
import { createLogger } from 'redux-logger'
import reducer from '../reducer'

const enhancers = applyMiddleware(createLogger())

export default createStore(reducer, enhancers)
