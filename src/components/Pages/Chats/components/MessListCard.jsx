import React from 'react'
import dayjs from 'dayjs'
import { CheckCheck, MoreVertical, Trash2 } from 'lucide-react'
import { Typography, Image, Avatar, Spin, Popconfirm, Button } from 'antd'

const { Text } = Typography

/**
 * MessListCard Component
 * Renders individual messages in the chat interface.
 * Handles three types: 'text', 'image', and 'system'.
 */
const MessListCard = ({ message, isSender, highlight = '', onDelete }) => {
    const { type, text, url, createdAt, id } = message
    const time = createdAt ? dayjs(createdAt.toDate()).format('h:mm A') : ''

    const renderText = (content) => {
        if (!highlight || !content) return content
        // Escape special characters to prevent RegExp crashes
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

    // System messages are centered and styled differently
    if (type === 'system') {
        return (
            <div className="flex justify-center my-6">
                <span className="px-6 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-full text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase shadow-sm animate-in fade-in zoom-in duration-500">
                    {text}
                </span>
            </div>
        )
    }

    const containerClass = isSender ? "flex justify-end" : "flex justify-start"
    
    // Bubble styles based on sender/receiver
    const bubbleClass = isSender 
        ? "bg-gradient-to-br from-[#6366F1] via-[#5B5CE2] to-[#4F46E5] text-white rounded-3xl rounded-tr-sm shadow-lg shadow-indigo-200/50" 
        : "bg-white dark:bg-[#1f212c] text-gray-700 dark:text-gray-200 border border-gray-100/80 dark:border-gray-800 rounded-3xl rounded-tl-sm shadow-sm"
    
    return (
        <div className={`group flex flex-col gap-2 ${isSender ? 'items-end' : 'items-start'} mb-2 ${message.isPending ? 'opacity-70 grayscale-[0.2]' : ''}`}>
            <div className={`${containerClass} w-full flex items-center gap-2 group/msg`}>
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
                            className="opacity-0 group-hover/msg:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200"
                            icon={<Trash2 size={14} />}
                        />
                    </Popconfirm>
                )}

                {type === 'text' ? (
                    <div className={`${bubbleClass} px-5 py-3.5 max-w-[85%] md:max-w-[70%] transition-all duration-300 hover:shadow-md active:scale-[0.98]`}>
                        <Text className={`text-[15px] leading-relaxed block ${isSender ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                            {renderText(text)}
                        </Text>
                    </div>
                ) : (
                    <div className="max-w-[85%] md:max-w-[70%] transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]">
                        <div className="rounded-[24px] overflow-hidden shadow-md border-4 border-white dark:border-[#1f212c] ring-1 ring-gray-100 dark:ring-gray-800">
                            <Image 
                                src={url} 
                                alt="Shared media" 
                                className="object-cover cursor-pointer hover:brightness-105 transition-all"
                                style={{ maxHeight: '400px' }}
                                placeholder={
                                    <div className="w-full h-[200px] bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                        <Spin />
                                    </div>
                                }
                            />
                        </div>
                    </div>
                )}
            </div>
            
            {/* Metadata (Time and Status) */}
            <div className={`flex items-center gap-2 ${isSender ? 'mr-2' : 'ml-2'} opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0`}>
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

export default MessListCard
