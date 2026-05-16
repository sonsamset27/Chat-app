import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Avatar, Badge, Tooltip, Typography } from 'antd'
import { MessageSquare, Search, User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../Context/AuthContext'
import { db } from '../../firebase/config'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import useIncomingRequests from '../../hooks/useIncomingRequests'
import useConversations from '../../hooks/useConversations'

const { Text, Title } = Typography

const Sidebar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { currentUser, userProfile, logout } = useAuth()
    const { requests } = useIncomingRequests()
    const { totalUnread } = useConversations()

    const activeKey = location.pathname.startsWith('/settings') ? '/settings' : location.pathname

    const setStatus = async (status) => {
        try {
            await updateDoc(doc(db, 'PROFILES', currentUser.uid), {
                status,
                lastSeen: serverTimestamp(),
            })
        } catch (error) {
            console.error('Set status error:', error)
        }
    }

    const handleLogout = async () => {
        try {
            await setStatus('offline')
            await logout()
            navigate('/login')
        } catch (err) {
            console.error('Logout error:', err)
        }
    }

    const navItems = [
        { key: '/chats',    icon: <MessageSquare size={22} />, label: 'Chats',     badge: totalUnread },
        { key: '/search',   icon: <Search size={22} />,        label: 'Tìm kiếm',  badge: 0 },
        { key: '/profile',  icon: <User size={22} />,          label: 'Hồ sơ',     badge: requests.length },
        { key: '/settings', icon: <Settings size={22} />,      label: 'Cài đặt',   badge: 0 },
    ]

    return (
        <>
            {/* ==============================
                MOBILE BOTTOM TAB BAR (< md)
                ============================== */}
            <nav className="
                flex md:hidden
                flex-row items-stretch
                w-full h-[60px]
                bg-white dark:bg-[#1a1b26]
                border-t border-gray-100 dark:border-gray-800
                z-50
            ">
                {navItems.map(item => {
                    const isActive = activeKey === item.key
                    return (
                        <button
                            key={item.key}
                            onClick={() => navigate(item.key)}
                            className={`
                                flex flex-col items-center justify-center gap-1
                                flex-1 h-full cursor-pointer transition-all duration-200
                                border-none bg-transparent
                                ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}
                            `}
                        >
                            {/* Wrap icon in a fixed-size relative container so Badge doesn't shift layout */}
                            <div className="relative w-6 h-6 flex items-center justify-center">
                                {item.icon}
                                {item.badge > 0 && (
                                    <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                                {item.label}
                            </span>
                        </button>
                    )
                })}
            </nav>

            {/* ==============================
                TABLET ICON SIDEBAR (md - lg)
                ============================== */}
            <aside className="
                hidden md:flex lg:hidden
                flex-col items-center
                w-[72px] h-full
                bg-white dark:bg-[#1a1b26]
                border-r border-gray-100 dark:border-gray-800
                py-4 gap-1 z-40
                transition-colors duration-300
            ">
                {/* Avatar */}
                <div className="mb-4">
                    <Avatar
                        src={userProfile?.avatar || currentUser?.photoURL || undefined}
                        size={38}
                        className="bg-[#5B5CE2]"
                    >
                        {(userProfile?.name || currentUser?.displayName || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                </div>

                {/* Nav Icons */}
                <div className="flex flex-col items-center gap-1 flex-1 w-full px-2">
                    {navItems.map(item => {
                        const isActive = activeKey === item.key
                        return (
                            <Tooltip key={item.key} title={item.label} placement="right">
                                <button
                                    onClick={() => navigate(item.key)}
                                    className={`
                                        relative w-full flex items-center justify-center
                                        p-3 rounded-2xl cursor-pointer
                                        transition-all duration-200 border-none
                                        ${isActive
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                            : 'bg-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-200'
                                        }
                                    `}
                                >
                                    <Badge count={item.badge} size="small" offset={[4, -4]}>
                                        {item.icon}
                                    </Badge>
                                </button>
                            </Tooltip>
                        )
                    })}
                </div>

                {/* Logout */}
                <Tooltip title="Đăng xuất" placement="right">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center p-3 rounded-2xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors border-none cursor-pointer"
                    >
                        <LogOut size={20} />
                    </button>
                </Tooltip>
            </aside>

            {/* ==============================
                DESKTOP FULL SIDEBAR (>= lg)
                ============================== */}
            <aside className="
                hidden lg:flex
                flex-col
                w-[260px] h-full
                bg-white dark:bg-[#1a1b26]
                border-r border-gray-100 dark:border-gray-800
                z-40
                transition-colors duration-300
            ">
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-6 py-5 shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                        <MessageSquare size={16} className="text-white" />
                    </div>
                    <Title level={5} className="!mb-0 !text-[#5B5CE2] !font-black tracking-tight">
                        Let's Chat
                    </Title>
                </div>

                {/* Profile */}
                <div className="mx-4 mb-4 px-3 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex items-center gap-3 shrink-0">
                    <Avatar
                        src={userProfile?.avatar || currentUser?.photoURL || undefined}
                        size={36}
                        className="bg-[#5B5CE2] shrink-0"
                    >
                        {(userProfile?.name || currentUser?.displayName || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <Text strong className="block text-sm truncate leading-tight">
                            {userProfile?.name || currentUser?.displayName || 'Người dùng'}
                        </Text>
                        <Text type="secondary" className="block text-[11px] truncate">
                            {currentUser?.email || ''}
                        </Text>
                    </div>
                </div>

                {/* Nav Items */}
                <div className="flex-1 px-4 flex flex-col gap-1">
                    {navItems.map(item => {
                        const isActive = activeKey === item.key
                        return (
                            <button
                                key={item.key}
                                onClick={() => navigate(item.key)}
                                className={`
                                    w-full flex items-center gap-3
                                    px-4 py-3 rounded-2xl
                                    text-sm font-medium text-left
                                    cursor-pointer transition-all duration-200 border-none
                                    ${isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold'
                                        : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'
                                    }
                                `}
                            >
                                <Badge count={item.badge} size="small" offset={[4, -4]}>
                                    <span className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}>
                                        {item.icon}
                                    </span>
                                </Badge>
                                {item.label}
                            </button>
                        )
                    })}
                </div>

                {/* Logout */}
                <div className="p-4 shrink-0">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors border-none cursor-pointer"
                    >
                        <LogOut size={16} />
                        Đăng xuất
                    </button>
                </div>
            </aside>
        </>
    )
}

export default Sidebar