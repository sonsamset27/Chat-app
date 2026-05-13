import React from 'react'
import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import Sidebar from './Sidebar'

const { Content } = Layout

const ChatApp = () => {
    return (
        <Layout className="h-screen w-screen overflow-hidden flex flex-row transition-colors duration-300">
            <Sidebar />
            <Content className="flex-1 overflow-y-auto rounded-[0]">
                <Outlet />
            </Content>
        </Layout>
    )
}

export default ChatApp