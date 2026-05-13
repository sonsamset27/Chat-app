import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Badge, Typography } from 'antd'
import { MessageSquare, Search, User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../Context/AuthContext'
import { db } from '../../firebase/config'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import useIncomingRequests from '../../hooks/useIncomingRequests'
import useConversations from '../../hooks/useConversations'

const { Sider } = Layout
const { Text, Title } = Typography

const Sidebar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { currentUser, userProfile, logout } = useAuth()
    const { requests } = useIncomingRequests()
    const { totalUnread } = useConversations()

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
        { 
            key: '/chats', 
            icon: (
                <Badge count={totalUnread} size="small" offset={[5, 0]}>
                    <MessageSquare size={20} />
                </Badge>
            ), 
            label: 'Chats' 
        },
        { key: '/search', icon: <Search size={20} />, label: 'Search' },
        {
            key: '/profile', icon: (
                <Badge count={requests.length} size="small" offset={[5, 0]}>
                    <User size={20} />
                </Badge>
            ), label: 'Profile'
        },
        { key: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    ]

    return (
        <Sider width={280} theme="light" className="h-full border-r border-gray-100 dark:border-gray-800 flex flex-col transition-colors duration-300">
            <div className="flex flex-col h-full">
                {/* Logo area */}
                <div className="p-6 pb-2">
                    <Title level={6} className="!text-[#5B5CE2] !mb-0 flex items-center gap-2">
                        Let's Chat
                    </Title>
                </div>

                {/* Profile selector area */}
                <div className="px-6 py-4 flex items-center gap-3">
                    <Avatar
                        src={userProfile?.avatar || currentUser?.photoURL}
                        size={40}
                        className="bg-[#5B5CE2]"
                    >
                        {(userProfile?.name || currentUser?.displayName || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <Text strong className="block text-sm truncate">
                            {userProfile?.name || currentUser?.displayName || 'Người dùng'}
                        </Text>
                        <Text type="secondary" className="block text-xs truncate">
                            {currentUser?.email || ''}
                        </Text>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 px-4 mt-4">
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname.startsWith('/settings') ? '/settings' : location.pathname]}
                        onClick={({ key }) => navigate(key)}
                        items={navItems}
                        className="bg-transparent border-none custom-sidebar-menu"
                    />
                </div>

                {/* Bottom Status / Logout */}
                <div className="p-6 space-y-3">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-colors border-none cursor-pointer"
                    >
                        <LogOut size={16} />
                        Đăng xuất
                    </button>
                </div>
            </div>
        </Sider>
    )
}

export default Sidebar