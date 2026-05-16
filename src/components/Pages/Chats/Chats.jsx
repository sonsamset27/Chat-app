import React, { useState, useEffect, useRef } from 'react'
import { Avatar, Badge, Input, Button, Typography, Spin, Empty, Upload, Popover, Popconfirm, message } from 'antd'
import { Search, Paperclip, Smile, Send, User, Users, ChevronUp, Info, Trash2, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../../Context/AuthContext'
import useConversations from '../../../hooks/useConversations'
import useMessages from '../../../hooks/useMessages'
import useUploadImage from '../../../hooks/useUploadImage'
import ChatFriendListCard from './components/ChatFriendListCard'
import MessListCard from './components/MessListCard'
import CreateGroupModal from './components/CreateGroupModal'
import GroupDetailsModal from './components/GroupDetailsModal'
import EmojiPicker from 'emoji-picker-react'
import { useNavigate } from 'react-router-dom'

import { db } from '../../../firebase/config'
import { doc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore'

const { Text, Title } = Typography

const Chats = () => {
    const { currentUser } = useAuth()
    const { conversations, loading: loadingConvs } = useConversations()
    const [activeConvId, setActiveConvId] = useState(() => localStorage.getItem('activeConvId') || null)
    const [searchText, setSearchText] = useState('')
    const [inputMsg, setInputMsg] = useState('')
    const messagesEndRef = useRef(null)

    const activeConversation = conversations.find(c => c.id === activeConvId)
    const [activeOtherUser, setActiveOtherUser] = useState(null)
    const { messages, loading: loadingMsgs, loadingMore, loadMore, hasMore, sendMessage, deleteMessage } = useMessages(activeConvId)
    const { uploadImage, uploading } = useUploadImage()
    const [showScrollBtn, setShowScrollBtn] = useState(false)
    const scrollRef = useRef(null)
    const navigate = useNavigate()
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
    const [isGroupDetailsOpen, setIsGroupDetailsOpen] = useState(false)
    const [messageSearchText, setMessageSearchText] = useState('')
    const [showMobileSearch, setShowMobileSearch] = useState(false)

    // Sync activeConvId to localStorage
    useEffect(() => {
        if (activeConvId) {
            localStorage.setItem('activeConvId', activeConvId)
        } else {
            localStorage.removeItem('activeConvId')
        }
    }, [activeConvId])

    // Listen to Active Other User's Profile + reset unread count
    useEffect(() => {
        if (!activeConversation || !currentUser) {
            setActiveOtherUser(null)
            return
        }

        if (activeConversation.unreadCount?.[currentUser.uid] > 0) {
            const convRef = doc(db, 'CONVERSATIONS', activeConvId)
            updateDoc(convRef, { [`unreadCount.${currentUser.uid}`]: 0 })
        }

        const otherUid = activeConversation?.participants?.find(uid => uid !== currentUser?.uid)
        if (!otherUid) return

        const unsub = onSnapshot(doc(db, 'PROFILES', otherUid), (snap) => {
            if (snap.exists()) setActiveOtherUser({ id: snap.id, ...snap.data() })
        })
        return () => unsub()
    }, [activeConversation?.id, currentUser?.uid])

    const handleDeleteConversation = async () => {
        if (!activeConversation) return
        try {
            await deleteDoc(doc(db, 'CONVERSATIONS', activeConversation.id))
            setActiveConvId(null)
            message.success("Đã xóa cuộc trò chuyện")
        } catch (error) {
            message.error("Không thể xóa cuộc trò chuyện")
        }
    }

    const scrollToBottom = (behavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior })
    }

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
        setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200)
    }

    useEffect(() => {
        if (messages.length > 0 && !showScrollBtn) scrollToBottom("smooth")
    }, [messages.length])

    const handleSend = async () => {
        if (!inputMsg.trim()) return
        const msg = inputMsg
        setInputMsg('')
        await sendMessage(msg)
        scrollToBottom("smooth")
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
        // Full height layout, flex row always (both list and chat visible on md+)
        // On mobile: only one panel visible at a time
        <div className="flex flex-row h-full overflow-hidden bg-white dark:bg-[#1a1b26]">

            {/* ===== CONVERSATION LIST ===== */}
            {/* Mobile: full width, hidden when chat is open */}
            {/* md+: fixed width sidebar, always visible */}
            <div className={`
                flex flex-col h-full
                bg-white dark:bg-[#1a1b26]
                border-r border-gray-100 dark:border-gray-800
                transition-colors duration-300 shrink-0
                w-full md:w-[300px] lg:w-[340px]
                ${activeConvId ? 'hidden md:flex' : 'flex'}
            `}>
                {/* Header */}
                <div className="px-5 lg:px-6 pt-5 lg:pt-6 pb-4 shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <Title level={2} className="!m-0 !text-xl lg:!text-2xl !font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
                            Chats
                        </Title>
                        <Button
                            type="text"
                            icon={<Users size={20} className="text-indigo-600 dark:text-indigo-400" />}
                            onClick={() => setIsCreateGroupOpen(true)}
                            className="flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl"
                            title="Tạo nhóm chat"
                        />
                    </div>
                    <Input
                        placeholder="Tìm kiếm hội thoại..."
                        prefix={<Search size={15} className="text-gray-400" />}
                        className="rounded-2xl border-none bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm"
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-3 lg:px-4 pb-4 space-y-1 custom-scrollbar">
                    {loadingConvs ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3">
                            <Spin size="small" />
                            <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Đang tải...</Text>
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
                        <div className="flex flex-col items-center justify-center h-60 opacity-40">
                            <Empty description={<span className="text-gray-400 font-medium">Chưa có đoạn hội thoại nào</span>} />
                        </div>
                    )}
                </div>
            </div>

            {/* ===== ACTIVE CHAT AREA ===== */}
            {/* Mobile: full width, hidden when no chat selected */}
            {/* md+: fills remaining space, always visible */}
            <div className={`
                flex flex-col h-full overflow-hidden
                flex-1
                bg-[#F3F4FB] dark:bg-[#0f1016]
                transition-colors duration-300
                ${!activeConvId ? 'hidden md:flex' : 'flex'}
            `}>
                {activeConversation ? (
                    <div className="flex flex-col h-full">

                        {/* Chat Header */}
                        <div className="
                            border-b border-gray-100 dark:border-gray-800
                            bg-white dark:bg-[#1a1b26]
                            shadow-sm shrink-0
                        ">
                            {/* Main header row */}
                            <div className="flex justify-between items-center px-4 md:px-5 lg:px-8 py-3 md:py-4">
                                {/* Left: back button + avatar + name */}
                                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 overflow-hidden pr-2">
                                    {/* Back button — mobile only */}
                                    <Button
                                        type="text"
                                        icon={<ArrowLeft size={20} />}
                                        onClick={() => setActiveConvId(null)}
                                        className="md:hidden flex items-center justify-center p-1 text-gray-500 hover:text-indigo-600 shrink-0"
                                    />

                                    {/* Avatar */}
                                    {activeConversation?.isGroup ? (
                                        <Avatar
                                            size={40}
                                            className="bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-sm ring-2 ring-indigo-50 dark:ring-indigo-900/30 shrink-0 flex items-center justify-center text-white"
                                        >
                                            <Users size={20} />
                                        </Avatar>
                                    ) : (
                                        <Badge dot status={activeOtherUser?.status === 'online' ? 'success' : 'default'} offset={[-3, 30]}>
                                            <Avatar
                                                src={(activeOtherUser?.photoURL || activeOtherUser?.avatar) || undefined}
                                                size={40}
                                                className={`ring-2 ring-indigo-50 dark:ring-indigo-900/30 shrink-0 flex items-center justify-center font-bold ${(!activeOtherUser?.photoURL && !activeOtherUser?.avatar) ? 'bg-gradient-to-br from-indigo-400 to-violet-500 text-white' : ''}`}
                                            >
                                                {(activeOtherUser?.displayName || activeOtherUser?.name)?.charAt(0)?.toUpperCase() || '?'}
                                            </Avatar>
                                        </Badge>
                                    )}

                                    {/* Name + status — overflow-hidden prevents vertical text glitch */}
                                    <div className="min-w-0 overflow-hidden max-w-[110px] sm:max-w-[180px] lg:max-w-none">
                                        <p className="text-[14px] lg:text-[15px] font-bold text-gray-800 dark:text-gray-100 truncate leading-tight m-0">
                                            {activeConversation?.isGroup
                                                ? activeConversation.groupName
                                                : (activeOtherUser?.displayName || activeOtherUser?.name || 'Đang tải...')}
                                        </p>
                                        {!activeConversation?.isGroup && (
                                            <div className="flex items-center gap-1 overflow-hidden">
                                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeOtherUser?.status === 'online' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                                <span className={`hidden lg:inline text-[11px] font-semibold whitespace-nowrap ${activeOtherUser?.status === 'online' ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {activeOtherUser?.status === 'online' ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: actions */}
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                    {/* Search input — hidden on mobile, shown from sm+ */}
                                    <div className="hidden sm:block">
                                        <Input
                                            placeholder="Tìm tin nhắn..."
                                            prefix={<Search size={13} className="text-gray-400" />}
                                            value={messageSearchText}
                                            onChange={(e) => setMessageSearchText(e.target.value)}
                                            className="rounded-2xl border-none bg-gray-50 dark:bg-gray-800/50 text-sm w-[90px] md:w-[120px] lg:w-[200px]"
                                        />
                                    </div>

                                    {/* Search toggle icon — mobile only */}
                                    <Button
                                        type="text"
                                        icon={<Search size={18} />}
                                        onClick={() => setShowMobileSearch(prev => !prev)}
                                        className={`block lg:!hidden rounded-xl ${showMobileSearch ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'text-gray-400 hover:text-indigo-600'}`}
                                        title="Tìm kiếm tin nhắn"
                                    />

                                    {!activeConversation?.isGroup && activeOtherUser?.id && (
                                        <Button
                                            type="text"
                                            icon={<User size={18} />}
                                            onClick={() => navigate(`/profile/${activeOtherUser.id}`)}
                                            className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl"
                                            title="Trang cá nhân"
                                        />
                                    )}

                                    {activeConversation?.isGroup && (
                                        <Button
                                            type="text"
                                            icon={<Info size={18} />}
                                            onClick={() => setIsGroupDetailsOpen(true)}
                                            className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl"
                                            title="Thông tin nhóm"
                                        />
                                    )}

                                    <Popconfirm
                                        title="Xóa cuộc trò chuyện?"
                                        description="Hành động này sẽ xóa đoạn chat đối với tất cả thành viên."
                                        onConfirm={handleDeleteConversation}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                        okButtonProps={{ danger: true }}
                                    >
                                        <Button
                                            type="text"
                                            danger
                                            icon={<Trash2 size={18} />}
                                            className="hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"
                                            title="Xóa đoạn chat"
                                        />
                                    </Popconfirm>
                                </div>
                            </div>

                            {/* Mobile search bar — slides in below header when toggled */}
                            {showMobileSearch && (
                                <div className="sm:hidden px-4 pb-3">
                                    <Input
                                        autoFocus
                                        placeholder="Tìm kiếm trong cuộc trò chuyện..."
                                        prefix={<Search size={14} className="text-gray-400" />}
                                        suffix={
                                            messageSearchText ? (
                                                <button
                                                    onClick={() => setMessageSearchText('')}
                                                    className="text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer text-xs font-medium"
                                                >
                                                    Xóa
                                                </button>
                                            ) : null
                                        }
                                        value={messageSearchText}
                                        onChange={(e) => setMessageSearchText(e.target.value)}
                                        className="rounded-2xl border border-indigo-100 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20 focus-within:border-indigo-300 transition-all"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Messages List */}
                        <div
                            className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-4 lg:py-6 flex flex-col gap-2 custom-scrollbar"
                            onScroll={handleScroll}
                            ref={scrollRef}
                        >
                            {/* Load more */}
                            {hasMore && (
                                <div className="flex justify-center pb-4">
                                    <button
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="flex items-center gap-2 px-5 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                                    >
                                        {loadingMore ? <Spin size="small" /> : <ChevronUp size={14} />}
                                        {loadingMore ? 'Đang tải...' : 'Xem tin nhắn cũ hơn'}
                                    </button>
                                </div>
                            )}

                            {loadingMsgs && messages.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center"><Spin /></div>
                            ) : (
                                messages
                                    .filter(msg => !messageSearchText || (msg.text && msg.text.toLowerCase().includes(messageSearchText.toLowerCase())))
                                    .map((msg) => (
                                        <MessListCard
                                            key={msg.id}
                                            message={msg}
                                            isSender={msg.senderId === currentUser?.uid}
                                            highlight={messageSearchText}
                                            onDelete={() => deleteMessage(msg.id)}
                                        />
                                    ))
                            )}
                            <div ref={messagesEndRef} className="h-2" />
                        </div>

                        {/* Scroll to bottom floating button */}
                        {showScrollBtn && (
                            <button
                                onClick={() => scrollToBottom("smooth")}
                                className="absolute bottom-24 right-6 z-20 w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center transition-all hover:scale-110 border-none cursor-pointer"
                            >
                                <ChevronUp size={18} className="rotate-180" />
                            </button>
                        )}

                        {/* Message Input Bar */}
                        <div className="px-3 md:px-5 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1b26] shrink-0">
                            <div className="max-w-4xl mx-auto flex items-center gap-2">
                                {/* Upload button */}
                                <Upload
                                    showUploadList={false}
                                    customRequest={({ file, onSuccess }) => {
                                        handleImageUpload(file)
                                        onSuccess("ok")
                                    }}
                                    disabled={uploading}
                                >
                                    <button className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition shrink-0 border-none bg-transparent cursor-pointer">
                                        <Paperclip size={18} />
                                    </button>
                                </Upload>

                                {/* Input */}
                                <div className="flex-1 relative">
                                    <Input
                                        placeholder="Nhập tin nhắn..."
                                        value={inputMsg}
                                        onChange={(e) => setInputMsg(e.target.value)}
                                        onPressEnter={handleSend}
                                        className="h-10 md:h-11 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 pr-10 text-sm md:text-[15px]"
                                    />
                                    <Popover
                                        content={
                                            <EmojiPicker
                                                onEmojiClick={(emojiData) => setInputMsg(prev => prev + emojiData.emoji)}
                                                theme="auto"
                                            />
                                        }
                                        trigger="click"
                                        placement="topLeft"
                                    >
                                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition border-none bg-transparent cursor-pointer">
                                            <Smile size={17} />
                                        </button>
                                    </Popover>
                                </div>

                                {/* Send button */}
                                <button
                                    onClick={handleSend}
                                    className="w-10 h-10 md:w-11 md:h-11 shrink-0 rounded-xl flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white transition border-none cursor-pointer"
                                >
                                    <Send size={17} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Empty state — visible on md+ when no chat selected */
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8 opacity-60">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center">
                            <Users size={30} className="text-indigo-500" />
                        </div>
                        <Title level={5} className="!mb-1 !text-gray-500 dark:!text-gray-400">Chưa chọn cuộc trò chuyện</Title>
                        <Text className="text-gray-400 text-sm max-w-xs">Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin</Text>
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateGroupModal
                isOpen={isCreateGroupOpen}
                onClose={() => setIsCreateGroupOpen(false)}
                onGroupCreated={(newId) => setActiveConvId(newId)}
            />
            <GroupDetailsModal
                isOpen={isGroupDetailsOpen}
                onClose={() => setIsGroupDetailsOpen(false)}
                conversation={activeConversation}
            />
        </div>
    )
}

export default Chats
