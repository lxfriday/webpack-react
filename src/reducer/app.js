export const APP_CHANGE_NAME = `APP_CHANGE_NAME`
export const APP_INC_AGE = `APP_INC_AGE`
export const APP_DEC_AGE = `APP_DEC_AGE`

const initialState = {
  name: 'lxfriday',
  age: 24,
  school: 'hzau',
}

export default function app(state = initialState, { type, payload }) {
  switch (type) {
    case APP_CHANGE_NAME: {
      return {
        ...state,
        name: payload.name,
      }
    }
    case APP_INC_AGE: {
      return {
        ...state,
        age: state.age + 1,
      }
    }
    case APP_DEC_AGE: {
      return {
        ...state,
        age: state.age - 1,
      }
    }
    default:
      return state
  }
}
