import React, { useState } from 'react'
import { Card, Avatar, Button, Typography, Space } from 'antd'
import { MessageSquarePlus, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useFriendship from '../../../../hooks/useFriendship'

const { Title, Text } = Typography

const SearchRecentCard = ({ user }) => {
    const navigate = useNavigate()
    const { friendship, loading, sendRequest, acceptRequest } = useFriendship(user.userId)
    const [requesting, setRequesting] = useState(false)

    const handleViewProfile = () => {
        navigate(`/profile/${user.userId}`)
    }

    const handleAddFriend = async (e) => {
        e.stopPropagation()
        setRequesting(true)
        await sendRequest()
        setRequesting(false)
    }

    const handleMessage = (e) => {
        e.stopPropagation()
        navigate(`/chats`) // Should pass user context to chat in real app
    }

    return (
        <Card
            className="rounded-2xl shadow-sm hover:border-[#5B5CE2]/30 transition-colors cursor-pointer"
            onClick={handleViewProfile}
            styles={{ body: { padding: '16px' } }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar 
                        src={user.avatar ? `${user.avatar}` : undefined} 
                        size={48} 
                        shape="square" 
                        className="rounded-xl bg-[#5B5CE2]" 
                    >
                        {user.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <div className="max-w-[200px]">
                        <Title level={5} className="!mb-0 !text-sm truncate">{user.name}</Title>
                        <Text type="secondary" className="text-xs mt-0.5 block truncate" title={user.bio}>
                            {user.bio || 'Chưa có tiểu sử'}
                        </Text>
                    </div>
                </div>
                <Space size="middle">
                    {friendship?.status === 'accepted' ? (
                        <Button 
                            type="text" 
                            icon={<MessageSquarePlus size={18} />} 
                            className="text-gray-400 hover:text-[#5B5CE2] hover:bg-blue-50" 
                            onClick={handleMessage}
                        />
                    ) : friendship?.status === 'pending' ? (
                        friendship.requesterId === user.userId ? (
                            <Button 
                                type="primary" 
                                className="rounded-lg text-xs font-bold shadow-none px-4"
                                onClick={(e) => { e.stopPropagation(); acceptRequest(); }}
                                loading={loading}
                            >
                                Chấp nhận
                            </Button>
                        ) : (
                            <Button disabled type="text" className="text-xs">Đã gửi</Button>
                        )
                    ) : (
                        <Button 
                            type="text" 
                            icon={<UserPlus size={18} />} 
                            className="text-gray-400 hover:text-[#5B5CE2] hover:bg-blue-50"
                            onClick={handleAddFriend}
                            loading={requesting || loading}
                        />
                    )}
                    
                    <Button className="rounded-lg text-xs font-bold text-gray-600" onClick={handleViewProfile}>
                        Trang cá nhân
                    </Button>
                </Space>
            </div>
        </Card>
    )
}

export default SearchRecentCard
