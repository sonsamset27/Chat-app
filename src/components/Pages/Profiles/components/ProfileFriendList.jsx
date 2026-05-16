import React from 'react'
import { Avatar, Button, Typography, Empty, Tooltip } from 'antd'
import { MessageSquarePlus, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

const ProfileFriendList = ({ friends }) => {
    const navigate = useNavigate()

    if (!friends || friends.length === 0) {
        return <Empty description="Bạn chưa có người bạn nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
    }

    return (
        <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
            {friends.map((friend) => (
                <div
                    key={friend.userId}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                    {/* Avatar */}
                    <Avatar
                        src={friend.avatar || undefined}
                        size={44}
                        className="bg-[#5B5CE2] shrink-0"
                    >
                        {friend.name?.charAt(0).toUpperCase()}
                    </Avatar>

                    {/* Name + status — min-w-0 prevents text from going vertical */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                        <Text strong className="block text-sm truncate">{friend.name}</Text>
                        <div className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <Text type="secondary" className="text-[11px] whitespace-nowrap">
                                {friend.status === 'online' ? 'Đang hoạt động' : 'Ngoại tuyến'}
                            </Text>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                        <Button
                            type="text"
                            size="small"
                            icon={<MessageSquarePlus size={16} />}
                            className="text-gray-400 hover:text-[#5B5CE2] hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                            onClick={() => navigate('/chats')}
                            title="Nhắn tin"
                        />
                        {/* Icon-only on mobile */}
                        <Tooltip title="Trang cá nhân">
                            <Button
                                type="text"
                                size="small"
                                icon={<User size={16} />}
                                className="sm:hidden text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                onClick={() => navigate(`/profile/${friend.userId}`)}
                            />
                        </Tooltip>
                        {/* Full text on sm+ */}
                        <Button
                            size="small"
                            className="rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hidden sm:inline-flex"
                            onClick={() => navigate(`/profile/${friend.userId}`)}
                        >
                            Trang cá nhân
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ProfileFriendList