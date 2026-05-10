import React from 'react'
import { Card, Avatar, Typography, Space, Spin, Empty } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../Context/AuthContext'
import useFriendList from '../../../../hooks/useFriendList'

const { Title, Text } = Typography

const MutualFriendList = ({ otherUid }) => {
    const { currentUser } = useAuth()
    const navigate = useNavigate()
    
    const { friends: myFriends, loading: loadingMine } = useFriendList(currentUser?.uid)
    const { friends: otherFriends, loading: loadingOther } = useFriendList(otherUid)

    const loading = loadingMine || loadingOther

    // Find intersection
    const mutualFriends = myFriends.filter(myFriend => 
        otherFriends.some(otherFriend => otherFriend.userId === myFriend.userId)
    )

    return (
        <Card className="rounded-3xl shadow-sm border-gray-100 dark:border-gray-800 transition-colors duration-300" styles={{ body: { padding: '24px' } }}>
            <Title level={5} className="mb-4!">Bạn chung ({mutualFriends.length})</Title>
            
            {loading ? (
                <div className="flex justify-center py-6"><Spin /></div>
            ) : mutualFriends.length > 0 ? (
                <Space size="large" className="w-full overflow-x-auto pb-2">
                    {mutualFriends.map(friend => (
                        <div 
                            key={friend.userId} 
                            className="flex flex-col items-center gap-2 cursor-pointer group"
                            onClick={() => navigate(`/profile/${friend.userId}`)}
                        >
                            <Avatar 
                                src={friend.avatar || undefined} 
                                size={56} 
                                className="bg-[#5B5CE2] group-hover:ring-2 ring-[#5B5CE2] transition-all"
                            >
                                {friend.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Text strong className="text-xs truncate max-w-[80px]">{friend.name}</Text>
                        </div>
                    ))}
                </Space>
            ) : (
                <Empty description="Không có bạn chung" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
        </Card>
    )
}

export default MutualFriendList