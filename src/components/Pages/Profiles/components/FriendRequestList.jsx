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
        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30 transition-colors overflow-hidden">
            {/* Left: avatar + name */}
            <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => navigate(`/profile/${user.userId}`)}>
                <Avatar
                    src={user.avatar || undefined}
                    size={38}
                    className="bg-[#5B5CE2] shrink-0"
                >
                    {user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <div className="min-w-0 overflow-hidden">
                    <Text strong className="block text-sm truncate">{user.name}</Text>
                    <Text type="secondary" className="text-[10px] whitespace-nowrap">Muốn kết bạn với bạn</Text>
                </div>
            </div>
            {/* Right: action buttons */}
            <div className="flex items-center gap-1 shrink-0">
                <Button
                    type="primary"
                    shape="circle"
                    size="small"
                    icon={<Check size={14} />}
                    className="bg-[#5B5CE2] border-none shadow-sm"
                    onClick={acceptRequest}
                    loading={loading}
                />
                <Button
                    shape="circle"
                    size="small"
                    icon={<X size={14} />}
                    className="hover:text-red-500 hover:border-red-200"
                    onClick={rejectRequest}
                    loading={loading}
                />
            </div>
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
