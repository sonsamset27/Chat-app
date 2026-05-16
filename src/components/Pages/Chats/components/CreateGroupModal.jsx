import React, { useState, useMemo } from 'react'
import { Modal, Input, List, Avatar, Checkbox, Spin, Empty, Typography } from 'antd'
import { Search, Users } from 'lucide-react'
import useFriendList from '../../../../hooks/useFriendList'
import useCreateGroupChat from '../../../../hooks/useCreateGroupChat'
import { useAuth } from '../../../../Context/AuthContext'

const { Text } = Typography

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
    const { currentUser } = useAuth()
    const { friends, loading: friendsLoading } = useFriendList(currentUser?.uid)
    const { createGroupChat, loading: creating } = useCreateGroupChat()

    const [groupName, setGroupName] = useState('')
    const [searchText, setSearchText] = useState('')
    const [selectedIds, setSelectedIds] = useState([])

    // Filter friends by search
    const filteredFriends = useMemo(() => {
        if (!searchText.trim()) return friends
        return friends.filter(f =>
            (f.displayName || f.name || '').toLowerCase().includes(searchText.toLowerCase())
        )
    }, [friends, searchText])

    const handleToggleSelect = (uid) => {
        setSelectedIds(prev =>
            prev.includes(uid)
                ? prev.filter(id => id !== uid)
                : [...prev, uid]
        )
    }

    const handleCreate = async () => {
        const newGroupId = await createGroupChat(groupName, selectedIds)
        if (newGroupId) {
            // Reset state
            setGroupName('')
            setSelectedIds([])
            setSearchText('')
            onClose()
            if (onGroupCreated) onGroupCreated(newGroupId)
        }
    }

    return (
        <Modal
            title={<div className="flex items-center gap-2"><Users size={20} className="text-indigo-600" /> Tạo Nhóm Chat</div>}
            open={isOpen}
            onCancel={onClose}
            onOk={handleCreate}
            okText="Tạo nhóm"
            cancelText="Hủy"
            confirmLoading={creating}
            okButtonProps={{ disabled: !groupName.trim() || selectedIds.length < 2, className: 'bg-indigo-600' }}
            destroyOnHidden
            className="dark:bg-gray-800"
        >
            <div className="flex flex-col gap-4 py-4">
                <Input
                    placeholder="Nhập tên nhóm..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    size="large"
                    className="rounded-xl"
                />

                <Input
                    placeholder="Tìm kiếm bạn bè..."
                    prefix={<Search size={16} className="text-gray-400" />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="rounded-xl bg-gray-50 dark:bg-gray-800/50"
                />

                <div className="border border-gray-100 dark:border-gray-700 rounded-xl max-h-[300px] overflow-y-auto custom-scrollbar">
                    {friendsLoading ? (
                        <div className="p-8 flex justify-center"><Spin /></div>
                    ) : filteredFriends.length > 0 ? (
                        <List
                            dataSource={filteredFriends}
                            renderItem={(friend) => (
                                <List.Item
                                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors border-b-0"
                                    onClick={() => handleToggleSelect(friend.userId)}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar src={friend.photoURL || friend.avatar} className="bg-indigo-100 text-indigo-600 font-bold">
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
                        <div className="p-8"><Empty description="Không tìm thấy bạn bè nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /></div>
                    )}
                </div>
                <Text type="secondary" className="text-[12px]">
                    Đã chọn {selectedIds.length} thành viên (Yêu cầu ít nhất 2 người)
                </Text>
            </div>
        </Modal>
    )
}

export default CreateGroupModal
