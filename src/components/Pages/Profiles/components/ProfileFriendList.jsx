import React from 'react'
import { Avatar, Button, Typography, Space, Empty } from 'antd'
import { MessageSquarePlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

const ProfileFriendList = ({ friends }) => {
    const navigate = useNavigate()

    if (!friends || friends.length === 0) {
        return <Empty description="Bạn chưa có người bạn nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
    }

    return (
        <Space orientation="vertical" size="middle" className="w-full max-h-[400px] overflow-y-auto pr-2">
            {friends.map((friend) => (
                <div key={friend.userId} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <Space size="middle">
                        <Avatar 
                            src={friend.avatar || undefined} 
                            size={44} 
                            className="bg-[#5B5CE2]"
                        >
                            {friend.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <div>
                            <Text strong className="block text-sm">{friend.name}</Text>
                            <Text type="secondary" className="text-[10px]">
                                {friend.status === 'online' ? 'Đang hoạt động' : 'Ngoại tuyến'}
                            </Text>
                        </div>
                    </Space>
                    <Space size="middle">
                        <Button 
                            type="text" 
                            icon={<MessageSquarePlus size={18} />} 
                            className="text-gray-400 hover:text-[#5B5CE2] hover:bg-blue-50 dark:hover:bg-blue-900/30" 
                            onClick={() => navigate('/chats')}
                        />
                        <Button 
                            className="rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300"
                            onClick={() => navigate(`/profile/${friend.userId}`)}
                        >
                            Trang cá nhân
                        </Button>
                    </Space>
                </div>
            ))}
        </Space>
    )
}

export default ProfileFriendList