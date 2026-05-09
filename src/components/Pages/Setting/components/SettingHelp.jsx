import React from 'react'
import { Typography } from 'antd'
import { HelpCircle } from 'lucide-react'

const { Title, Text } = Typography

const SettingHelp = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <HelpCircle size={24} className="text-[#5B5CE2]" />
            </div>
            <Title level={4} className="dark:text-white">Trợ giúp & Hỗ trợ</Title>
            <Text type="secondary" className="dark:text-gray-400">Chúng tôi đang hoàn thiện phần này. Vui lòng quay lại sau.</Text>
        </div>
    )
}

export default SettingHelp
