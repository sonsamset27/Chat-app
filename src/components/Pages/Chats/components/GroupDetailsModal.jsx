import React, { useState, useMemo } from 'react'
import { Modal, Tabs, List, Avatar, Button, Typography, Spin, Empty, Input, Checkbox, Popconfirm } from 'antd'
import { Search, UserMinus, UserPlus, ShieldAlert } from 'lucide-react'
import useGroupManagement from '../../../../hooks/useGroupManagement'
import useFriendList from '../../../../hooks/useFriendList'
import { useAuth } from '../../../../Context/AuthContext'

const { Text } = Typography

const GroupDetailsModal = ({ isOpen, onClose, conversation }) => {
    const { currentUser } = useAuth()
    const { friends, loading: friendsLoading } = useFriendList(currentUser?.uid)
    const { members, loadingMembers, actionLoading, addMembers, removeMember } = useGroupManagement(conversation?.id, conversation?.participants)

    const [activeTab, setActiveTab] = useState('1')
    const [searchText, setSearchText] = useState('')
    const [selectedIds, setSelectedIds] = useState([])

    const isAdmin = conversation?.admin === currentUser?.uid

    // Reset state when tab changes
    const handleTabChange = (key) => {
        setActiveTab(key)
        setSearchText('')
        setSelectedIds([])
    }

    // Filter members for Tab 1
    const filteredMembers = useMemo(() => {
        if (!searchText.trim()) return members
        return members.filter(m =>
            (m.displayName || m.name || '').toLowerCase().includes(searchText.toLowerCase())
        )
    }, [members, searchText])

    // Filter friends for Tab 2 (exclude existing members)
    const availableFriends = useMemo(() => {
        const existingIds = new Set(conversation?.participants || [])
        const unaddedFriends = friends.filter(f => !existingIds.has(f.userId))

        if (!searchText.trim()) return unaddedFriends
        return unaddedFriends.filter(f =>
            (f.displayName || f.name || '').toLowerCase().includes(searchText.toLowerCase())
        )
    }, [friends, conversation?.participants, searchText])

    const handleToggleSelect = (uid) => {
        setSelectedIds(prev =>
            prev.includes(uid)
                ? prev.filter(id => id !== uid)
                : [...prev, uid]
        )
    }

    const handleAddSelected = async () => {
        const success = await addMembers(selectedIds)
        if (success) {
            setSelectedIds([])
            setSearchText('')
            setActiveTab('1') // Go back to members list
        }
    }

    const handleRemove = async (uid, memberName) => {
        await removeMember(uid, memberName)
    }

    if (!conversation) return null

    const renderMembersTab = () => (
        <div className="flex flex-col gap-4">
            <Input
                placeholder="Tìm kiếm thành viên..."
                prefix={<Search size={16} className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="rounded-xl bg-gray-50 dark:bg-gray-800/50"
            />
            <div className="border border-gray-100 dark:border-gray-700 rounded-xl max-h-[300px] overflow-y-auto custom-scrollbar">
                {loadingMembers ? (
                    <div className="p-8 flex justify-center"><Spin /></div>
                ) : filteredMembers.length > 0 ? (
                    <List
                        dataSource={filteredMembers}
                        renderItem={(member) => {
                            const isMemberAdmin = member.id === conversation.admin || member.userId === conversation.admin
                            const isMe = member.id === currentUser?.uid || member.userId === currentUser?.uid

                            return (
                                <List.Item
                                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b-0"
                                    actions={[
                                        isAdmin && !isMemberAdmin && !isMe && (
                                            <Popconfirm
                                                key="remove"
                                                title="Xóa thành viên?"
                                                description="Hành động này không thể hoàn tác."
                                                onConfirm={() => handleRemove(member.id || member.userId, member.displayName || member.name)}
                                                okButtonProps={{ danger: true, loading: actionLoading }}
                                            >
                                                <Button type="text" danger icon={<UserMinus size={16} />} title="Xóa khỏi nhóm" />
                                            </Popconfirm>
                                        )
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                src={(member.avatar || member.photoURL) ? (member.avatar || member.photoURL) : undefined}
                                                className={`bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center ${!(member.avatar || member.photoURL) ? 'bg-indigo-500 text-white' : ''}`}
                                            >
                                                {(member.displayName || member.name || 'U').charAt(0).toUpperCase()}
                                            </Avatar>
                                        }
                                        title={
                                            <div className="flex items-center gap-2">
                                                <Text strong className="dark:text-gray-200">
                                                    {member.displayName || member.name} {isMe && '(Bạn)'}
                                                </Text>
                                                {isMemberAdmin && (
                                                    <span className="text-[10px] text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                                        <ShieldAlert size={10} /> Admin
                                                    </span>
                                                )}
                                            </div>
                                        }
                                        description={<Text type="secondary" className="text-[12px] truncate max-w-[200px]">{member.email}</Text>}
                                    />
                                </List.Item>
                            )
                        }}
                    />
                ) : (
                    <div className="p-8"><Empty description="Không tìm thấy thành viên" image={Empty.PRESENTED_IMAGE_SIMPLE} /></div>
                )}
            </div>
        </div>
    )

    const renderAddTab = () => (
        <div className="flex flex-col gap-4">
            <Input
                placeholder="Tìm bạn bè để thêm..."
                prefix={<Search size={16} className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="rounded-xl bg-gray-50 dark:bg-gray-800/50"
            />
            <div className="border border-gray-100 dark:border-gray-700 rounded-xl max-h-[300px] overflow-y-auto custom-scrollbar">
                {friendsLoading ? (
                    <div className="p-8 flex justify-center"><Spin /></div>
                ) : availableFriends.length > 0 ? (
                    <List
                        dataSource={availableFriends}
                        renderItem={(friend) => (
                            <List.Item
                                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors border-b-0"
                                onClick={() => handleToggleSelect(friend.userId)}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar
                                            src={(friend.avatar || friend.photoURL) ? (friend.avatar || friend.photoURL) : undefined}
                                            className={`bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center ${!(friend.avatar || friend.photoURL) ? 'bg-indigo-500 text-white' : ''}`}
                                        >
                                            {(friend.displayName || friend.name || 'U').charAt(0).toUpperCase()}
                                        </Avatar>
                                    }
                                    title={<Text strong className="dark:text-gray-200">{friend.displayName || friend.name}</Text>}
                                    description={<Text type="secondary" className="text-[12px] truncate max-w-[200px]">{friend.email}</Text>}
                                />
                                <Checkbox checked={selectedIds.includes(friend.userId)} />
                            </List.Item>
                        )}
                    />
                ) : (
                    <div className="p-8"><Empty description="Không còn bạn bè nào có thể thêm" image={Empty.PRESENTED_IMAGE_SIMPLE} /></div>
                )}
            </div>
            {selectedIds.length > 0 && (
                <Button
                    type="primary"
                    icon={<UserPlus size={16} />}
                    className="w-full h-10 rounded-xl bg-indigo-600"
                    loading={actionLoading}
                    onClick={handleAddSelected}
                >
                    Thêm {selectedIds.length} người vào nhóm
                </Button>
            )}
        </div>
    )

    return (
        <Modal
            title={<div className="flex items-center gap-2"><Text strong className="text-lg">Thông tin nhóm</Text></div>}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            destroyOnHidden
            className="dark:bg-gray-800"
        >
            <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                items={[
                    {
                        key: '1',
                        label: `Thành viên (${conversation?.participants?.length || 0})`,
                        children: renderMembersTab(),
                    },
                    {
                        key: '2',
                        label: 'Thêm người',
                        children: renderAddTab(),
                    }
                ]}
            />
        </Modal>
    )
}

export default GroupDetailsModal
