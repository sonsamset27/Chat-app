import React, { useState, useEffect, useRef } from 'react'
import { Layout, Avatar, Badge, Input, Button, Typography, Divider, Spin, Empty, Upload } from 'antd'
import { Search, Bell, MoreVertical, Paperclip, Smile, Send, User, ChevronUp } from 'lucide-react'
import { useAuth } from '../../../Context/AuthContext'
import useConversations from '../../../hooks/useConversations'
import useMessages from '../../../hooks/useMessages'
import useUploadImage from '../../../hooks/useUploadImage'
import ChatFriendListCard from './components/ChatFriendListCard'
import MessListCard from './components/MessListCard'

import { db } from '../../../firebase/config'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'

const { Sider, Content } = Layout
const { Text, Title } = Typography

const Chats = () => {
    const { currentUser } = useAuth()
    const { conversations, loading: loadingConvs } = useConversations()
    const [activeConvId, setActiveConvId] = useState(null)
    const [searchText, setSearchText] = useState('')
    const [inputMsg, setInputMsg] = useState('')
    const messagesEndRef = useRef(null)

    const activeConversation = conversations.find(c => c.id === activeConvId)
    const [activeOtherUser, setActiveOtherUser] = useState(null)
    const { messages, loading: loadingMsgs, loadingMore, loadMore, hasMore, sendMessage, deleteMessage } = useMessages(activeConvId)
    const { uploadImage, uploading } = useUploadImage()
    const [showScrollBtn, setShowScrollBtn] = useState(false)
    const scrollRef = useRef(null)

    // Listen to Active Other User's Profile
    useEffect(() => {
        if (!activeConversation || !currentUser) {
            setActiveOtherUser(null)
            return
        }

        // Reset unread count for current user
        if (activeConversation.unreadCount?.[currentUser.uid] > 0) {
            const convRef = doc(db, 'CONVERSATIONS', activeConvId)
            updateDoc(convRef, {
                [`unreadCount.${currentUser.uid}`]: 0
            })
        }

        const otherUid = activeConversation?.participants?.find(uid => uid !== currentUser?.uid)
        if (!otherUid) return

        const unsub = onSnapshot(doc(db, 'PROFILES', otherUid), (snap) => {
            if (snap.exists()) setActiveOtherUser({ id: snap.id, ...snap.data() })
        })
        return () => unsub()
    }, [activeConversation?.id, currentUser?.uid])

    const scrollToBottom = (behavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior })
    }

    // Monitor scroll position to show/hide jump-to-bottom button
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200
        setShowScrollBtn(!isNearBottom)
    }

    useEffect(() => {
        // Only auto-scroll if we are near bottom or if it's the initial load
        if (messages.length > 0 && !showScrollBtn) {
            scrollToBottom("smooth")
        }
    }, [messages.length])

    const handleSend = async () => {
        if (!inputMsg.trim()) return
        const msg = inputMsg
        setInputMsg('') // Clear input immediately
        await sendMessage(msg)
        scrollToBottom("smooth") // Scroll immediately
    }

    const handleImageUpload = async (file) => {
        if (!file) return

        try {
            const url = await uploadImage(file)
            if (url) {
                await sendMessage('', 'image', url)
                scrollToBottom("smooth")
            }
        } catch (err) {
            console.error("Image upload failed:", err)
        }
    }

    return (
        <Layout className="h-full flex flex-row overflow-hidden bg-white dark:bg-[#1a1b26] transition-colors duration-300">
            {/* Chat List */}
            <Sider width={340} className="bg-white dark:bg-[#1a1b26] border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0 transition-colors duration-300" theme="light">
                <div className="p-8 pb-4">
                    <div className="flex justify-between items-center mb-8">
                        <Title level={2} className="!m-0 !text-2xl !font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
                            Chats
                        </Title>
                        <Button
                            type="text"
                            icon={<Bell size={22} className="text-gray-400 dark:text-gray-500 hover:text-indigo-600 transition-colors" />}
                            className="flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl"
                        />
                    </div>

                    <Input
                        placeholder="Tìm kiếm hội thoại..."
                        prefix={<Search size={18} className="text-gray-400" />}
                        className="rounded-2xl border-none bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 transition-all py-3 px-4 text-gray-600 dark:text-gray-300"
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
                    {loadingConvs ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3">
                            <Spin size="small" />
                            <Text className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest">Loading chats</Text>
                        </div>
                    ) : conversations.length > 0 ? (
                        conversations.map((conv) => (
                            <ChatFriendListCard
                                key={conv.id}
                                conversation={conv}
                                active={activeConvId === conv.id}
                                onClick={() => setActiveConvId(conv.id)}
                                searchTerm={searchText}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-60 opacity-40 dark:opacity-20">
                            <Empty description={<span className="text-gray-400 font-medium">Chưa có đoạn hội thoại nào</span>} />
                        </div>
                    )}
                </div>
            </Sider>

            {/* Active Chat Area */}
            <Content className="flex flex-col bg-[#F3F4FB] dark:bg-[#0f1016] h-full relative overflow-hidden transition-colors duration-300">
                {activeConversation ? (
                    <div className="flex flex-col h-full bg-white/40 dark:bg-black/10 backdrop-blur-[2px] relative z-0">
                        {/* Chat Header */}
                        <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-[#1a1b26]/90 backdrop-blur-xl flex justify-between items-center sticky top-0 z-20 shadow-sm transition-colors duration-300">
                            <div className="flex items-center gap-4 group cursor-pointer">
                                <Badge dot status={activeOtherUser?.status === 'online' ? 'success' : 'default'} offset={[-4, 34]} size="large">
                                    <Avatar src={activeOtherUser?.photoURL || activeOtherUser?.avatar} size={48} className="ring-2 ring-indigo-50 dark:ring-indigo-900/30 transition-all group-hover:ring-indigo-200" />
                                </Badge>
                                <div>
                                    <Title level={5} className="!mb-0.5 !text-[15px] !font-bold text-gray-800 dark:text-gray-100 tracking-tight transition-colors">
                                        {activeOtherUser?.displayName || activeOtherUser?.name || 'Loading...'}
                                    </Title>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${activeOtherUser?.status === 'online' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                        <Text className={`text-[11px] ${activeOtherUser?.status === 'online' ? 'text-green-600' : 'text-gray-400 dark:text-gray-500'} font-bold uppercase tracking-wider transition-colors`}>
                                            {activeOtherUser?.status === 'online' ? 'Online' : 'Offline'}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-2">
                                    <Button type="text" icon={<Bell size={20} />} className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl" />
                                    <Button type="text" icon={<MoreVertical size={20} />} className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl" />
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            className="flex-1 overflow-y-auto p-8 flex flex-col gap-2 scroll-smooth"
                            onScroll={handleScroll}
                            ref={scrollRef}
                        >
                            {/* Load More Button */}
                            {hasMore && (
                                <div className="flex justify-center pb-8 pt-4">
                                    <button 
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 rounded-full shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/30 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95 disabled:opacity-50 group"
                                    >
                                        {loadingMore ? (
                                            <Spin size="small" />
                                        ) : (
                                            <ChevronUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                                        )}
                                        <span className="text-[11px] font-bold uppercase tracking-wider">
                                            {loadingMore ? 'Đang tải...' : 'Xem tin nhắn cũ hơn'}
                                        </span>
                                    </button>
                                </div>
                            )}

                            {loadingMsgs && messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center flex-1 gap-4">
                                    <div className="flex flex-col items-center justify-center h-full opacity-40">
                                        <Spin />
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <MessListCard
                                        key={msg.id}
                                        message={msg}
                                        isSender={msg.senderId === currentUser?.uid}
                                        onDelete={() => deleteMessage(msg.id)}
                                    />
                                ))
                            )}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>

                        {/* Floating Scroll Button */}
                        {showScrollBtn && (
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<Send size={18} className="rotate-90" />}
                                onClick={() => scrollToBottom("smooth")}
                                className="absolute bottom-32 right-12 z-20 shadow-xl shadow-indigo-200/50 hover:scale-110 transition-transform bg-indigo-600 border-none w-12 h-12 flex items-center justify-center"
                            />
                        )}

                        {/* Message Input */}
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1b26]">
                            <div className="max-w-4xl mx-auto flex items-center gap-3">

                                {/* Upload */}
                                <Upload
                                    showUploadList={false}
                                    customRequest={({ file, onSuccess }) => {
                                        handleImageUpload(file)
                                        onSuccess("ok")
                                    }}
                                    disabled={uploading}
                                >
                                    <button
                                        className="w-11 h-11 flex items-center justify-center rounded-xl text-gray-500 hover:text-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                    >
                                        <Paperclip size={20} />
                                    </button>
                                </Upload>

                                {/* Input */}
                                <div className="flex-1 relative">
                                    <Input
                                        placeholder="Type a message..."
                                        value={inputMsg}
                                        onChange={(e) => setInputMsg(e.target.value)}
                                        onPressEnter={handleSend}
                                        className="h-11 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 pr-12 text-[15px]"
                                    />

                                    {/* Emoji */}
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition">
                                        <Smile size={18} />
                                    </button>
                                </div>

                                {/* Send */}
                                <button
                                    onClick={handleSend}
                                    className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white transition"
                                >
                                    <Send size={18} />
                                </button>

                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <Empty description="Chọn một cuộc trò chuyện để bắt đầu" />
                    </div>
                )}
            </Content>
        </Layout>
    )
}

export default Chats
