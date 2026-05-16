import React from 'react'
import { User, Bell, Shield, Palette, HelpCircle } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const SettingBar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const activeTab = location.pathname.split('/').pop() || 'account'

    const menuItems = [
        { key: 'account', icon: <User size={17} />, label: 'Tài khoản' },
        { key: 'notifications', icon: <Bell size={17} />, label: 'Thông báo' },
        { key: 'security', icon: <Shield size={17} />, label: 'Bảo mật' },
        { key: 'appearance', icon: <Palette size={17} />, label: 'Giao diện' },
        { key: 'help', icon: <HelpCircle size={17} />, label: 'Trợ giúp' },
    ]

    return (
        // Mobile: flex-row (horizontal tabs), Desktop: flex-col (vertical list)
        <div className="flex flex-row md:flex-col gap-1">
            {menuItems.map(item => {
                const isActive = activeTab === item.key
                return (
                    <button
                        key={item.key}
                        onClick={() => navigate(`/settings/${item.key}`)}
                        className={`
                            flex items-center gap-2 md:gap-3
                            px-3 py-2.5 md:px-4 md:py-3
                            rounded-xl cursor-pointer
                            whitespace-nowrap text-sm font-medium
                            transition-all duration-200 border-none
                            ${isActive
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold'
                                : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                            }
                        `}
                    >
                        <span className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}>
                            {item.icon}
                        </span>
                        {item.label}
                    </button>
                )
            })}
        </div>
    )
}

export default SettingBar
