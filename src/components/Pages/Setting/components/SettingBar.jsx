import React from 'react'
import { Menu } from 'antd'
import { User, Bell, Shield, Palette, HelpCircle } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const SettingBar = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const activeTab = location.pathname.split('/').pop() || 'account'

    const menuItems = [
        { key: 'account', icon: <User size={18} />, label: 'Tài khoản' },
        { key: 'notifications', icon: <Bell size={18} />, label: 'Thông báo' },
        { key: 'security', icon: <Shield size={18} />, label: 'Bảo mật' },
        { key: 'appearance', icon: <Palette size={18} />, label: 'Giao diện' },
        { key: 'help', icon: <HelpCircle size={18} />, label: 'Trợ giúp' },
    ]

    return (
        <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            onClick={({ key }) => navigate(`/settings/${key}`)}
            items={menuItems}
            className="border-none rounded-2xl bg-transparent custom-settings-menu dark:text-gray-300 dark:bg-transparent"
        />
    )
}

export default SettingBar
