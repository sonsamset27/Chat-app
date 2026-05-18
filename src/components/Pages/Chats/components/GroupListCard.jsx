import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { CheckCheck, Trash2 } from 'lucide-react'
import { Typography, Image, Avatar, Spin, Popconfirm, Button } from 'antd'
import { db } from '../../../../firebase/config'
import { doc, onSnapshot } from 'firebase/firestore'

const { Text } = Typography

const GroupListCard = ({ message, isSender, highlight = '', onDelete }) => {
    const { type, text, url, createdAt, senderId } = message
    const time = createdAt ? dayjs(createdAt.toDate()).format('h:mm A') : ''
    const [senderProfile, setSenderProfile] = useState(null)

    // Listen to Sender's Profile
    useEffect(() => {
        if (!senderId) return
        const unsub = onSnapshot(doc(db, 'PROFILES', senderId), (snap) => {
            if (snap.exists()) {
                setSenderProfile({ id: snap.id, ...snap.data() })
            }
        })
        return () => unsub()
    }, [senderId])

    const renderText = (content) => {
        if (!highlight || !content) return content
        const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const parts = content.split(new RegExp(`(${escapedHighlight})`, 'gi'))
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase()
                        ? <mark key={i} className="bg-yellow-200 text-black rounded px-0.5">{part}</mark>
                        : part
                )}
            </span>
        )
    }

    // System messages
    if (type === 'system') {
        return (
            <div className="flex justify-center my-6">
                <span className="px-6 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-full text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase shadow-sm animate-in fade-in zoom-in duration-500">
                    {text}
                </span>
            </div>
        )
    }

    const bubbleClass = isSender
        ? "bg-gradient-to-br from-[#6366F1] via-[#5B5CE2] to-[#4F46E5] text-white rounded-3xl rounded-tr-sm shadow-lg shadow-indigo-200/50"
        : "bg-white dark:bg-[#1f212c] text-gray-700 dark:text-gray-200 border border-gray-100/80 dark:border-gray-800 rounded-3xl rounded-tl-sm shadow-sm"

    const displayName = senderProfile?.name || senderProfile?.displayName || '...'
    const rawAvatar = senderProfile?.avatar || senderProfile?.photoURL
    const avatarUrl = (rawAvatar && rawAvatar.trim() !== '') ? rawAvatar : undefined

    return (
        <div className={`group flex flex-col gap-1 ${isSender ? 'items-end' : 'items-start'} mb-3 ${message.isPending ? 'opacity-70 grayscale-[0.2]' : ''}`}>

            {/* Sender Name above message bubble (only for other members or if we want full info) */}
            {!isSender && (
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 ml-12 mb-0.5">
                    {displayName}
                </span>
            )}

            <div className={`flex items-start gap-2.5 w-full ${isSender ? 'justify-end' : 'justify-start'} group/msg`}>

                {/* Avatar (Left aligned for other members) */}
                {!isSender && (
                    <Avatar
                        src={avatarUrl}
                        size={36}
                        className={`shadow-sm shrink-0 font-bold border-2 border-white dark:border-gray-800 flex items-center justify-center ${!avatarUrl ? 'bg-gradient-to-br from-indigo-400 to-violet-500 text-white' : ''}`}
                    >
                        {displayName.charAt(0).toUpperCase()}
                    </Avatar>
                )}

                {/* Delete button for Sender (shown on hover on left of bubble) */}
                {isSender && !message.isPending && (
                    <Popconfirm
                        title="Xoá tin nhắn?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={onDelete}
                        okText="Xoá"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true, className: "bg-red-500" }}
                    >
                        <Button
                            type="text"
                            size="small"
                            className="opacity-0 group-hover/msg:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200 self-center"
                            icon={<Trash2 size={14} />}
                        />
                    </Popconfirm>
                )}

                {/* Message Bubble */}
                {type === 'text' ? (
                    <div className={`${bubbleClass} px-4 py-3 max-w-[75%] md:max-w-[65%] transition-all duration-300 hover:shadow-md active:scale-[0.98]`}>
                        <Text className={`text-[14px] leading-relaxed block ${isSender ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                            {renderText(text)}
                        </Text>
                    </div>
                ) : (
                    <div className="max-w-[75%] md:max-w-[65%] transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]">
                        <div className="rounded-[24px] overflow-hidden shadow-md border-4 border-white dark:border-[#1f212c] ring-1 ring-gray-100 dark:ring-gray-800">
                            <Image
                                src={url}
                                alt="Shared media"
                                className="object-cover cursor-pointer hover:brightness-105 transition-all"
                                style={{ maxHeight: '350px' }}
                                placeholder={
                                    <div className="w-full h-[180px] bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                        <Spin />
                                    </div>
                                }
                            />
                        </div>
                    </div>
                )}

                {/* Avatar (Right aligned for current user) */}
                {isSender && (
                    <Avatar
                        src={avatarUrl}
                        size={36}
                        className={`shadow-sm shrink-0 font-bold border-2 border-white dark:border-gray-800 flex items-center justify-center ${!avatarUrl ? 'bg-gradient-to-br from-indigo-400 to-violet-500 text-white' : ''}`}
                    >
                        {displayName.charAt(0).toUpperCase()}
                    </Avatar>
                )}
            </div>

            {/* Metadata (Time and Status) */}
            <div className={`flex items-center gap-2 ${isSender ? 'mr-11' : 'ml-12'} opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-0.5 group-hover:translate-y-0`}>
                <Text className="text-[10px] text-gray-400 dark:text-gray-600 font-medium tracking-tight">
                    {time}
                </Text>
                {isSender && (
                    <span className="text-[#6366F1] dark:text-[#818cf8] flex items-center bg-indigo-50 dark:bg-indigo-900/30 rounded-full p-0.5">
                        <CheckCheck size={10} strokeWidth={3} />
                    </span>
                )}
            </div>
        </div>
    )
}

export default GroupListCard