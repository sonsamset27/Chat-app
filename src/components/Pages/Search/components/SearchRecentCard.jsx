import React, { useState } from 'react'
import { Card, Avatar, Button, Typography, Tooltip } from 'antd'
import { MessageSquarePlus, UserPlus, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useFriendship from '../../../../hooks/useFriendship'

const { Title, Text } = Typography

const SearchRecentCard = ({ user }) => {
    const navigate = useNavigate()
    const { friendship, loading, sendRequest, acceptRequest } = useFriendship(user.userId)
    const [requesting, setRequesting] = useState(false)

    const handleViewProfile = () => navigate(`/profile/${user.userId}`)

    const handleAddFriend = async (e) => {
        e.stopPropagation()
        setRequesting(true)
        await sendRequest()
        setRequesting(false)
    }

    const handleMessage = (e) => {
        e.stopPropagation()
        navigate('/chats')
    }

    return (
        <Card
            className="rounded-2xl shadow-sm hover:border-[#5B5CE2]/30 transition-colors cursor-pointer overflow-hidden"
            onClick={handleViewProfile}
            styles={{ body: { padding: '12px 16px' } }}
        >
            <div className="flex items-center gap-3 min-w-0">
                {/* Avatar */}
                <Avatar
                    src={(user.avatar || user.photoURL) || undefined}
                    size={44}
                    shape="square"
                    className={`rounded-xl shrink-0 ${!(user.avatar || user.photoURL) ? 'bg-[#5B5CE2] flex items-center justify-center font-bold text-white' : ''}`}
                >
                    {(user.displayName || user.name)?.charAt(0)?.toUpperCase() || '?'}
                </Avatar>

                {/* Name + bio — flex-1 min-w-0 to prevent overflow */}
                <div className="flex-1 min-w-0 overflow-hidden">
                    <Title level={5} className="!mb-0 !text-sm truncate">
                        {user.name || user.displayName}
                    </Title>
                    <Text type="secondary" className="block text-xs truncate">
                        {user.bio || 'Chưa có tiểu sử'}
                    </Text>
                </div>

                {/* Actions — icon-only on mobile, with text on sm+ */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Friend action button */}
                    {friendship?.status === 'accepted' ? (
                        <Tooltip title="Nhắn tin">
                            <Button
                                type="text"
                                size="small"
                                icon={<MessageSquarePlus size={17} />}
                                className="text-gray-400 hover:text-[#5B5CE2] hover:bg-blue-50 rounded-lg"
                                onClick={handleMessage}
                            />
                        </Tooltip>
                    ) : friendship?.status === 'pending' ? (
                        friendship.requesterId === user.userId ? (
                            <Button
                                type="primary"
                                size="small"
                                className="rounded-lg text-xs font-bold shadow-none"
                                onClick={(e) => { e.stopPropagation(); acceptRequest() }}
                                loading={loading}
                            >
                                Chấp nhận
                            </Button>
                        ) : (
                            <span className="text-[11px] text-gray-400 font-medium px-1">Đã gửi</span>
                        )
                    ) : (
                        <Tooltip title="Kết bạn">
                            <Button
                                type="text"
                                size="small"
                                icon={<UserPlus size={17} />}
                                className="text-gray-400 hover:text-[#5B5CE2] hover:bg-blue-50 rounded-lg"
                                onClick={handleAddFriend}
                                loading={requesting || loading}
                            />
                        </Tooltip>
                    )}

                    {/* View profile: icon on mobile, text on sm+ */}
                    <Tooltip title="Trang cá nhân">
                        <Button
                            type="text"
                            size="small"
                            icon={<User size={16} />}
                            className="sm:hidden text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            onClick={handleViewProfile}
                        />
                    </Tooltip>
                    <Button
                        size="small"
                        className="hidden sm:inline-flex rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300"
                        onClick={handleViewProfile}
                    >
                        Trang cá nhân
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default SearchRecentCard
