import React from 'react'
import { Card, Avatar, Button, Typography, Space, Badge } from 'antd'
import { MessageSquarePlus } from 'lucide-react'
import { useAuth } from '../../../Context/AuthContext'

const { Title, Text, Paragraph } = Typography

const Profile = () => {
    const { currentUser, userProfile } = useAuth()

    const displayName = userProfile?.name || currentUser?.displayName || 'Người dùng'
    const avatarUrl = userProfile?.avatar || currentUser?.photoURL || ''
    const bio = userProfile?.bio || 'Chưa có tiểu sử'
    const status = userProfile?.status || 'offline'
    const email = currentUser?.email || ''

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#1a1b26] rounded-tl-[30px] shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300">

            {/* Content */}
            <div className="flex flex-col gap-3 p-8">
                {/* Main Profile Card */}
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

                {/* Mutual Friends */}
                <Card className="rounded-3xl shadow-sm border-gray-100 dark:border-gray-800 transition-colors duration-300" styles={{ body: { padding: '24px' } }}>
                    <Title level={5} className="mb-4!">Bạn bè</Title>
                    <Space orientation="vertical" size="middle" className="w-full mb-4 overflow-auto max-h-[250px]">
                        {[
                            { name: 'Lan Anh', time: 'Đã kết nối 2 năm', img: 5 },
                            { name: 'Quốc Bảo', time: 'Đã kết nối 6 tháng', img: 12 },
                            { name: 'Quốc Bảo', time: 'Đã kết nối 6 tháng', img: 12 }
                        ].map((friend, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <Space size="middle">
                                    <Avatar src={`https://i.pravatar.cc/150?img=${friend.img}`} size={40} />
                                    <div>
                                        <Text strong className="block text-sm">{friend.name}</Text>
                                        <Text type="secondary" className="text-[10px]">{friend.time}</Text>
                                    </div>
                                </Space>
                                <Space size="middle">
                                    <Button type="text" icon={<MessageSquarePlus size={18} />} className="text-gray-400 hover:text-[#5B5CE2] hover:bg-blue-50 dark:hover:bg-blue-900/30" />
                                    <Button className="rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300">
                                        Trang cá nhân
                                    </Button>
                                </Space>
                            </div>
                        ))}
                    </Space>
                </Card>
            </div>
        </div>
    )
}

export default Profile