import React from 'react'
import { Card, Avatar, Button, Typography, Space, Row, Col, Badge, Divider } from 'antd'
import { ArrowLeft, Bell, MoreVertical, MessageSquare, UserMinus, Ban, Globe, Volume2, AtSign } from 'lucide-react'
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
        <div className="h-full flex flex-col bg-white rounded-tl-[30px] shadow-sm overflow-hidden border border-gray-100">

            {/* Content */}
            <div className="flex flex-col gap-3 p-8">
                {/* Main Profile Card */}
                <Card className="rounded-3xl shadow-sm mb-6 border-gray-100" styles={{ body: { padding: '32px' } }}>
                    <div className="flex justify-between items-start mb-6">
                        <Space size="large" align="start">
                            <Badge dot status={status === 'online' ? 'success' : 'default'} offset={[-8, 85]}>
                                <Avatar src={avatarUrl || undefined} size={96} className="ring-4 ring-[#F8F9FE] bg-[#5B5CE2]">
                                    {displayName.charAt(0).toUpperCase()}
                                </Avatar>
                            </Badge>
                            <div className="pt-2">
                                <Title level={3} className="!mb-1">{displayName}</Title>
                                <Text type="secondary" className="text-sm">
                                    {status === 'online' ? 'Đang hoạt động' : 'Ngoại tuyến'} • {email}
                                </Text>
                            </div>
                        </Space>
                        <Space size="middle">
                            <Button type="primary" icon={<MessageSquare size={18} />} className="rounded-xl h-10 px-5 text-sm font-bold shadow-md shadow-[#5B5CE2]/20">
                                Nhắn tin
                            </Button>
                            <Button className="rounded-xl h-10 w-10 p-0 flex items-center justify-center border-gray-200 text-gray-600">
                                <UserMinus size={20} />
                            </Button>
                            <Button danger className="rounded-xl h-10 w-10 p-0 flex items-center justify-center border-red-100 text-red-500">
                                <Ban size={20} />
                            </Button>
                        </Space>
                    </div>

                    <div>
                        <Title level={5} className="!mb-2">Tiểu sử</Title>
                        <Paragraph className="text-sm text-gray-600 leading-relaxed mb-0">
                            {bio}
                        </Paragraph>
                    </div>
                </Card>



                {/* Mutual Friends */}
                <Card className="rounded-3xl shadow-sm border-gray-100" styles={{ body: { padding: '24px' } }}>
                    <Title level={5} className="!mb-4">Bạn chung (12)</Title>
                    <Space orientation="vertical" size="middle" className="w-full mb-4">
                        <div className="flex items-center justify-between">
                            <Space size="middle">
                                <Avatar src="https://i.pravatar.cc/150?img=5" size={40} />
                                <div>
                                    <Text strong className="block text-sm">Lan Anh</Text>
                                    <Text type="secondary" className="text-[10px]">Đã kết nối 2 năm</Text>
                                </div>
                            </Space>
                            <MoreVertical size={16} className="text-gray-400 cursor-pointer" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Space size="middle">
                                <Avatar src="https://i.pravatar.cc/150?img=12" size={40} />
                                <div>
                                    <Text strong className="block text-sm">Quốc Bảo</Text>
                                    <Text type="secondary" className="text-[10px]">Đã kết nối 6 tháng</Text>
                                </div>
                            </Space>
                            <MoreVertical size={16} className="text-gray-400 cursor-pointer" />
                        </div>
                    </Space>
                    <Divider className="my-4" />
                    <div className="flex items-center gap-2">
                        <Avatar.Group size="small" max={{ count: 2, style: { color: '#666', backgroundColor: '#f5f5f5', fontSize: '10px' } }}>
                            <Avatar src="https://i.pravatar.cc/150?img=20" />
                            <Avatar src="https://i.pravatar.cc/150?img=21" />
                            <Avatar>+9</Avatar>
                        </Avatar.Group>
                        <Text type="secondary" className="text-[10px]">và những người khác</Text>
                    </div>
                </Card>

            </div>
        </div>
    )
}

export default Profile