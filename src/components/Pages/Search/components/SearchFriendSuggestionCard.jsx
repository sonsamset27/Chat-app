import React, { useState } from 'react'
import { Card, Avatar, Button, Typography, Badge, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import useFriendship from '../../../../hooks/useFriendship'

const { Title, Text } = Typography

const SearchFriendSuggestionCard = ({ user }) => {
    const navigate = useNavigate()
    const { friendship, loading, sendRequest, acceptRequest } = useFriendship(user.userId)
    const [requesting, setRequesting] = useState(false)

    const handleAddFriend = async (e) => {
        e.stopPropagation()
        setRequesting(true)
        await sendRequest()
        setRequesting(false)
    }

    const handleViewProfile = () => {
        navigate(`/profile/${user.userId}`)
    }

    return (
        <Card
            className="rounded-2xl shadow-sm hover:shadow-md transition-all h-full cursor-pointer"
            onClick={handleViewProfile}
            styles={{ body: { padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' } }}
        >
            <div className="relative mb-4">
                <Badge dot status={user.status === 'online' ? 'success' : 'default'} offset={[-5, 70]} className="!mb-0">
                    <Avatar 
                        src={user.avatar ? `${user.avatar}` : undefined} 
                        size={80} 
                        className="shadow-sm ring-4 ring-[#F8F9FE] bg-[#5B5CE2]" 
                    >
                        {user.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                </Badge>
            </div>
            <Title level={5} className="!mb-0 text-center">{user.name}</Title>
            <Text type="secondary" className="text-[11px] mt-1 mb-4 text-center block max-w-full truncate px-2" title={user.bio}>
                {user.bio || 'Chưa có tiểu sử'}
            </Text>
            
            <div className="w-full mt-auto">
                {friendship?.status === 'pending' ? (
                    friendship.requesterId === user.userId ? (
                        <Button 
                            type="primary" 
                            block 
                            className="rounded-xl h-10 text-xs font-bold shadow-none"
                            onClick={(e) => { e.stopPropagation(); acceptRequest(); }}
                            loading={loading}
                        >
                            Chấp nhận
                        </Button>
                    ) : (
                        <Button disabled block className="rounded-xl h-10 text-xs font-bold bg-gray-100 text-gray-500 border-none">
                            Đã gửi yêu cầu
                        </Button>
                    )
                ) : friendship?.status === 'accepted' ? (
                    <Button disabled block className="rounded-xl h-10 text-xs font-bold bg-blue-50 text-[#5B5CE2] border-none">
                        Bạn bè
                    </Button>
                ) : (
                    <Button 
                        type="primary" 
                        block 
                        className="rounded-xl h-10 text-xs font-bold shadow-none"
                        onClick={handleAddFriend}
                        loading={requesting || loading}
                    >
                        Kết bạn
                    </Button>
                )}
            </div>
        </Card>
    )
}

export default SearchFriendSuggestionCard
