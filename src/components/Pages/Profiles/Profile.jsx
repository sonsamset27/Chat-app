import React from 'react'
import { Card, Avatar, Typography, Spin, Popconfirm } from 'antd'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../Context/AuthContext'
import { db } from '../../../firebase/config'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import useFriendList from '../../../hooks/useFriendList'
import useIncomingRequests from '../../../hooks/useIncomingRequests'
import ProfileFriendList from './components/ProfileFriendList'
import FriendRequestList from './components/FriendRequestList'

const { Title, Text, Paragraph } = Typography

const Profile = () => {
    const navigate = useNavigate()
    const { currentUser, userProfile, logout } = useAuth()
    const { friends, loading: loadingFriends } = useFriendList(currentUser?.uid)
    const { requests, loading: loadingRequests } = useIncomingRequests()

    const displayName = userProfile?.name || currentUser?.displayName || 'Người dùng'
    const avatarUrl = userProfile?.avatar || currentUser?.photoURL || ''
    const bio = userProfile?.bio || 'Chưa có tiểu sử'
    const status = userProfile?.status || 'offline'
    const email = currentUser?.email || ''

    const handleLogout = async () => {
        try {
            await updateDoc(doc(db, 'PROFILES', currentUser.uid), {
                status: 'offline',
                lastSeen: serverTimestamp(),
            })
            await logout()
            navigate('/login')
        } catch (err) {
            console.error('Logout error:', err)
        }
    }

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#1a1b26] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="flex flex-col gap-4 p-4 md:p-8 overflow-y-auto">

                {/* Profile Info Card */}
                <Card
                    className="rounded-2xl md:rounded-3xl shadow-sm border-gray-100 dark:border-gray-800 transition-colors duration-300"
                    styles={{ body: { padding: '20px' } }}
                >
                    {/* Avatar + Name row */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-5">
                        {/* Avatar with status dot */}
                        <div className="relative shrink-0">
                            <Avatar
                                src={avatarUrl || undefined}
                                size={{ xs: 72, sm: 80, md: 88 }}
                                className="ring-4 ring-gray-50 dark:ring-gray-800 bg-[#5B5CE2]"
                            >
                                {displayName.charAt(0).toUpperCase()}
                            </Avatar>
                            <span className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </div>

                        {/* Name + status */}
                        <div className="text-center sm:text-left pt-0 sm:pt-1 min-w-0">
                            <Title level={3} className="!mb-0.5 !text-xl md:!text-2xl truncate">{displayName}</Title>
                            <Text className={`text-sm font-medium ${status === 'online' ? 'text-green-600' : 'text-gray-400'}`}>
                                {status === 'online' ? 'Đang hoạt động' : 'Ngoại tuyến'}
                            </Text>
                            <Text type="secondary" className="block text-xs mt-0.5 truncate">{email}</Text>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="mb-4">
                        <Title level={5} className="!mb-1.5 !text-sm text-gray-500 uppercase tracking-wide font-bold">Tiểu sử</Title>
                        <Paragraph className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed !mb-0">
                            {bio}
                        </Paragraph>
                    </div>

                    {/* Logout — mobile only, separated by a divider */}
                    <div className="md:hidden pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Popconfirm
                            title="Đăng xuất?"
                            description="Bạn có chắc muốn đăng xuất không?"
                            onConfirm={handleLogout}
                            okText="Đăng xuất"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                            placement="top"
                        >
                            <button className="
                                w-full flex items-center justify-center gap-2
                                py-2.5 rounded-xl
                                text-sm font-semibold text-red-500
                                bg-red-50 hover:bg-red-100
                                dark:bg-red-900/20 dark:hover:bg-red-900/30
                                transition-colors border-none cursor-pointer
                            ">
                                <LogOut size={16} />
                                Đăng xuất
                            </button>
                        </Popconfirm>
                    </div>
                </Card>

                {/* Friends Card */}
                <Card
                    className="rounded-2xl md:rounded-3xl shadow-sm border-gray-100 dark:border-gray-800 transition-colors duration-300"
                    styles={{ body: { padding: '20px' } }}
                >
                    <FriendRequestList requests={requests} loading={loadingRequests} />

                    <div className="flex justify-between items-center mb-3">
                        <Title level={5} className="!mb-0">Bạn bè ({friends.length})</Title>
                    </div>

                    {loadingFriends ? (
                        <div className="flex justify-center py-8"><Spin /></div>
                    ) : (
                        <ProfileFriendList friends={friends} />
                    )}
                </Card>

            </div>
        </div>
    )
}

export default Profile