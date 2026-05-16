import React from 'react'
import { Typography } from 'antd'
import { Outlet } from 'react-router-dom'
import SettingBar from './components/SettingBar'

const { Title, Text } = Typography

const Settings = () => {
    return (
        <div className="h-full flex flex-col bg-[#F8F9FE] dark:bg-[#1a1b26] overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300">

            {/* Header */}
            <div className="px-4 md:px-8 py-4 md:py-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#24283b] transition-colors duration-300 shrink-0">
                <Title level={4} className="!mb-0.5 !text-lg md:!text-xl">Cài đặt</Title>
                <Text type="secondary" className="text-xs md:text-sm">Quản lý tùy chọn và cài đặt tài khoản của bạn</Text>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* Setting Navigation */}
                {/* Mobile: horizontal scrollable strip at top */}
                {/* Desktop: vertical sidebar on the left */}
                <div className="
                    bg-white dark:bg-[#24283b] transition-colors duration-300 shrink-0
                    border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800
                    overflow-x-auto md:overflow-x-visible md:overflow-y-auto
                    md:w-56 lg:w-64
                    p-2 md:p-4
                ">
                    <SettingBar />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-2xl mx-auto w-full">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings
