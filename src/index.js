import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import zhCN from 'antd/es/locale/zh_CN'
import { ConfigProvider } from 'antd'
import moment from 'moment'
import 'moment/locale/zh-cn'
import 'antd/dist/antd.css'

import App from './App'
import store from './store'
import './index.less'

moment.locale('zh-cn')

ReactDOM.render(
  <Provider store={store}>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </Provider>,
  document.querySelector('#root')
)
