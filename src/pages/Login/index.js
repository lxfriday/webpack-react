import React from 'react'
import { Card, Button } from 'antd'
import { connect } from 'react-redux'
import styles from './index.less'

import { APP_CHANGE_NAME, APP_DEC_AGE, APP_INC_AGE } from '../../reducer/app'

function Login({ dispatch, ...args }) {
  return (
    <div className={styles.container}>
      <Card>
        <Button type="primary" onClick={() => dispatch({ type: APP_CHANGE_NAME, payload: { name: 'yuny' } })}>
          press dsfgdg
        </Button>
        <Card>{JSON.stringify(args)}</Card>
        <Card>{JSON.stringify(args)}</Card>
      </Card>
    </div>
  )
}

export default connect(({ app }) => ({ ...app }))(Login)
