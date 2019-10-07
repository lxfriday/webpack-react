import React from 'react'
import { Card, Button } from 'antd'
import { connect } from 'react-redux'
import styles from './index.less'
import qiniu from '@/assets/img/qiniu.png'
import analytics from '@/assets/img/analytics.png'
import pic1 from '@/assets/img/1.jpg'

import { APP_CHANGE_NAME, APP_DEC_AGE, APP_INC_AGE } from '../../reducer/app'

function Login({ dispatch }) {
  return (
    <div className={styles.container}>
      <Card>
        <Button type="primary" onClick={() => dispatch({ type: APP_CHANGE_NAME, payload: { name: 'yuny' } })}>
          press
        </Button>
        <img alt="分析1" src={analytics} />
        <img alt="分析2" src={qiniu} />
        <img alt="分析3" src={pic1} />
      </Card>
    </div>
  )
}

export default connect(({ app }) => ({ ...app }))(Login)
