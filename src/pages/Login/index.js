import React from 'react'
import { Card, Button, TimePicker } from 'antd'
import { connect } from 'react-redux'
import styles from './index.less'
import analytics from '@/assets/img/analytics.png'

import { APP_CHANGE_NAME } from '../../reducer/app'
import { log } from './test'
import aJson from './a.json'

function Login({ dispatch }) {
  log('hello')
  console.log(aJson)
  console.log(process.env.NODE_ENV)

  return (
    <div className={styles.container}>
      <Card>
        <Button type="primary" onClick={() => dispatch({ type: APP_CHANGE_NAME, payload: { name: 'yuny' } })}>
          press me
        </Button>
        <img alt="分析1" src={analytics} />
        <div className="ttt">aaas</div>
        <TimePicker />
      </Card>
    </div>
  )
}

export default connect(({ app }) => ({ ...app }))(Login)
