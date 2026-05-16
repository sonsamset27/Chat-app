import React, { useState, useEffect } from 'react'
import { Avatar, Badge, Typography } from 'antd'
import { Users } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useAuth } from '../../../../Context/AuthContext'

import { db } from '../../../../firebase/config'
import { doc, onSnapshot } from 'firebase/firestore'

dayjs.extend(relativeTime)

const { Text } = Typography

const ChatFriendListCard = ({ conversation, active, onClick, searchTerm = '' }) => {
    const { currentUser } = useAuth()
    const { participants, lastMessageId, updatedAt, isGroup, groupName, unreadCount } = conversation
    const [otherUser, setOtherUser] = useState(null)
    const [lastMessage, setLastMessage] = useState(null)

    const otherUid = !isGroup ? participants.find(uid => uid !== currentUser?.uid) : null

    // Listen to Other User's Profile
    useEffect(() => {
        if (!otherUid) return
        const unsub = onSnapshot(doc(db, 'PROFILES', otherUid), (snap) => {
            if (snap.exists()) setOtherUser({ id: snap.id, ...snap.data() })
        })
        return () => unsub()
    }, [otherUid])

    // Listen to Last Message
    useEffect(() => {
        if (!lastMessageId) return
        const unsub = onSnapshot(doc(db, 'MESSAGES', lastMessageId), (snap) => {
            if (snap.exists()) setLastMessage({ id: snap.id, ...snap.data() })
        })
        return () => unsub()
    }, [lastMessageId])

    // Search Filtering
    if (searchTerm.trim()) {
        const matchName = isGroup 
            ? (groupName || '').toLowerCase()
            : (otherUser?.displayName || otherUser?.name || '').toLowerCase()
        if (!matchName.includes(searchTerm.toLowerCase())) {
            return null
        }
    }

    const time = updatedAt ? dayjs(updatedAt.toDate()).fromNow() : ''

    const getMessagePreview = () => {
        if (!lastMessage) return 'Bắt đầu trò chuyện'
        if (lastMessage.type === 'image') return 'Đã gửi một ảnh'
        if (lastMessage.type === 'system') return lastMessage.text
        return lastMessage.text
    }

    const isUnread = unreadCount && unreadCount[currentUser?.uid] > 0

    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-4 p-4 rounded-[24px] cursor-pointer transition-all duration-300 group ${active
                    ? 'bg-gradient-to-r from-indigo-50 to-white shadow-sm ring-1 ring-indigo-100/50 dark:from-indigo-900/40 dark:to-[#1a1b26] dark:ring-indigo-800/30'
                    : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/30'
                }`}
        >
            <div className="relative">
                {isGroup ? (
                    <Avatar size={52} className="bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-sm ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-white">
                        <Users size={24} />
                    </Avatar>
                ) : (
                    <Badge
                        dot
                        status={otherUser?.status === 'online' ? 'success' : 'default'}
                        offset={[-4, 38]}
                        className="scale-125"
                    >
                        <Avatar 
                            src={(otherUser?.photoURL || otherUser?.avatar) ? (otherUser.photoURL || otherUser.avatar) : undefined} 
                            size={52} 
                            className={`shadow-sm ring-2 ring-white dark:ring-gray-800 flex items-center justify-center font-bold text-lg ${(!otherUser?.photoURL && !otherUser?.avatar) ? 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 text-white' : ''}`}
                        >
                            {(otherUser?.displayName || otherUser?.name)?.charAt(0)?.toUpperCase() || '?'}
                        </Avatar>
                    </Badge>
                )}
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1 gap-2">
                    <Text strong className={`text-[15px] truncate transition-colors ${active ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-800 dark:text-gray-200'} ${isUnread ? 'font-black text-black dark:text-white' : ''}`}>
                        {isGroup ? groupName : (otherUser?.displayName || otherUser?.name || 'Loading...')}
                    </Text>
                    <Text className={`text-[10px] font-medium whitespace-nowrap shrink-0 ${active ? 'text-indigo-400 dark:text-indigo-500' : 'text-gray-400 dark:text-gray-500'} ${isUnread ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}`}>
                        {time}
                    </Text>
                </div>
                <div className="flex items-center gap-1.5 overflow-hidden">
                    {lastMessage?.senderId === currentUser?.uid && !active && (
                        <Text className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase shrink-0">You:</Text>
                    )}
                    <Text
                        className={`text-xs truncate block ${active ? 'text-indigo-600 dark:text-indigo-400 font-medium' : isUnread ? 'text-gray-800 dark:text-gray-100 font-bold' : 'text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        {getMessagePreview()}
                    </Text>
                </div>
            </div>

            {isUnread && !active && (
                <div className="flex shrink-0">
                    <Badge count={unreadCount[currentUser?.uid]} color="#5B5CE2" />
                </div>
            )}

            {active && !isUnread && (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-200 animate-pulse shrink-0" />
            )}
        </div>
    )
}

export default ChatFriendListCard
