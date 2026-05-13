import React from 'react'
import { Typography } from 'antd'
import { Outlet } from 'react-router-dom'

import SettingBar from './components/SettingBar'

const { Title, Text } = Typography

const Settings = () => {
    return (
        <div className="h-full flex flex-col bg-[#F8F9FE] dark:bg-[#1a1b26] shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#24283b] transition-colors duration-300">
                <Title level={3} className="mb-1!">Cài đặt</Title>
                <Text type="secondary">Quản lý tùy chọn và cài đặt tài khoản của bạn</Text>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-white dark:bg-[#24283b] border-r border-gray-100 dark:border-gray-800 flex flex-col p-4 transition-colors duration-300">
                    <SettingBar />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 flex justify-center">
                    <div className="max-w-2xl w-full">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings
