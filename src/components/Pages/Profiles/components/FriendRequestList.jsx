import React from 'react'
import { Avatar, Button, Typography, Space, Empty, Spin } from 'antd'
import { Check, X, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useFriendship from '../../../../hooks/useFriendship'

const { Text, Title } = Typography

const RequestItem = ({ user }) => {
    const navigate = useNavigate()
    const { acceptRequest, rejectRequest, loading } = useFriendship(user.userId)

    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30 transition-colors">
            <Space size="middle" className="cursor-pointer" onClick={() => navigate(`/profile/${user.userId}`)}>
                <Avatar 
                    src={user.avatar || undefined} 
                    size={40} 
                    className="bg-[#5B5CE2]"
                >
                    {user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                    <Text strong className="block text-sm">{user.name}</Text>
                    <Text type="secondary" className="text-[10px]">Muốn kết bạn với bạn</Text>
                </div>
            </Space>
            <Space size="small">
                <Button 
                    type="primary" 
                    shape="circle" 
                    icon={<Check size={16} />} 
                    className="bg-[#5B5CE2] border-none shadow-sm"
                    onClick={acceptRequest}
                    loading={loading}
                />
                <Button 
                    shape="circle" 
                    icon={<X size={16} />} 
                    className="hover:text-red-500 hover:border-red-200"
                    onClick={rejectRequest}
                    loading={loading}
                />
            </Space>
        </div>
    )
}

const FriendRequestList = ({ requests, loading }) => {
    if (loading) return <div className="flex justify-center py-6"><Spin /></div>
    
    if (!requests || requests.length === 0) return null

    return (
        <div className="mb-8">
            <Title level={5} className="mb-4! flex items-center gap-2">
                <User size={18} className="text-[#5B5CE2]" /> 
                Lời mời kết bạn ({requests.length})
            </Title>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {requests.map((user) => (
                    <RequestItem key={user.userId} user={user} />
                ))}
            </div>
            <div className="border-b border-gray-100 dark:border-gray-800 my-8"></div>
        </div>
    )
}



export default FriendRequestList
