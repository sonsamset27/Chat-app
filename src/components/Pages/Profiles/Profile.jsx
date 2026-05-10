import React from 'react'
import { Card, Avatar, Typography, Space, Badge, Spin } from 'antd'
import { useAuth } from '../../../Context/AuthContext'
import useFriendList from '../../../hooks/useFriendList'
import useIncomingRequests from '../../../hooks/useIncomingRequests'
import ProfileFriendList from './components/ProfileFriendList'
import FriendRequestList from './components/FriendRequestList'

const { Title, Text, Paragraph } = Typography

const Profile = () => {
    const { currentUser, userProfile } = useAuth()
    const { friends, loading: loadingFriends } = useFriendList(currentUser?.uid)
    const { requests, loading: loadingRequests } = useIncomingRequests()

    const displayName = userProfile?.name || currentUser?.displayName || 'Người dùng'
    const avatarUrl = userProfile?.avatar || currentUser?.photoURL || ''
    const bio = userProfile?.bio || 'Chưa có tiểu sử'
    const status = userProfile?.status || 'offline'
    const email = currentUser?.email || ''

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#1a1b26] rounded-tl-[30px] shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="flex flex-col gap-3 p-8 overflow-y-auto">
                <Card className="rounded-3xl shadow-sm mb-6 border-gray-100 dark:border-gray-800 transition-colors duration-300" styles={{ body: { padding: '32px' } }}>
                    <div className="flex justify-between items-start mb-6">
                        <Space size="large" align="start">
                            <Badge dot status={status === 'online' ? 'success' : 'default'} offset={[-8, 85]}>
                                <Avatar src={avatarUrl || undefined} size={96} className="ring-4 ring-[#F8F9FE] dark:ring-[#1a1b26] bg-[#5B5CE2] transition-colors duration-300">
                                    {displayName.charAt(0).toUpperCase()}
                                </Avatar>
                            </Badge>
                            <div className="pt-2">
                                <Title level={3} className="mb-1!">{displayName}</Title>
                                <Text type="secondary" className="text-sm">
                                    {status === 'online' ? 'Đang hoạt động' : 'Ngoại tuyến'} • {email}
                                </Text>
                            </div>
                        </Space>
                    </div>

                    <div>
                        <Title level={5} className="mb-2!">Tiểu sử</Title>
                        <Paragraph className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-0">
                            {bio}
                        </Paragraph>
                    </div>
                </Card>

                <Card className="rounded-3xl shadow-sm border-gray-100 dark:border-gray-800 transition-colors duration-300" styles={{ body: { padding: '24px' } }}>
                    <FriendRequestList requests={requests} loading={loadingRequests} />

                    <div className="flex justify-between items-center mb-6">
                        <Title level={5} className="mb-0!">Bạn bè ({friends.length})</Title>
                    </div>
                    
                    {loadingFriends ? (
                        <div className="flex justify-center py-10"><Spin /></div>
                    ) : (
                        <ProfileFriendList friends={friends} />
                    )}
                </Card>
            </div>
        </div>
    )
}

export default Profile