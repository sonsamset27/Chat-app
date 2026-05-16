import { useState } from 'react'
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../Context/AuthContext'
import { message } from 'antd'

const useCreateGroupChat = () => {
    const { currentUser } = useAuth()
    const [loading, setLoading] = useState(false)

    const createGroupChat = async (groupName, participantIds) => {
        if (!currentUser) return null
        if (!groupName.trim()) {
            message.error("Vui lòng nhập tên nhóm")
            return null
        }
        if (participantIds.length < 2) {
            message.error("Nhóm cần ít nhất 3 thành viên (bao gồm bạn)")
            return null
        }

        setLoading(true)
        try {
            // Add current user to participants
            const allParticipants = [...participantIds, currentUser.uid]
            
            // Initialize unread counts
            const unreadCount = {}
            allParticipants.forEach(id => {
                unreadCount[id] = 0
            })

            const newGroup = {
                isGroup: true,
                groupName: groupName.trim(),
                groupAvatar: '', // Could be updated later
                participants: allParticipants,
                admin: currentUser.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastMessageId: null,
                unreadCount: unreadCount
            }

            const docRef = await addDoc(collection(db, 'CONVERSATIONS'), newGroup)

            // System Message
            const sysMsgRef = await addDoc(collection(db, 'MESSAGES'), {
                conversationId: docRef.id,
                senderId: 'system',
                type: 'system',
                text: `${currentUser.displayName || currentUser.name || 'Một người'} đã tạo nhóm`,
                createdAt: serverTimestamp()
            })

            // Update conversation with last message
            await updateDoc(doc(db, 'CONVERSATIONS', docRef.id), {
                lastMessageId: sysMsgRef.id
            })

            message.success("Tạo nhóm thành công!")
            setLoading(false)
            return docRef.id
        } catch (error) {
            console.error("Error creating group:", error)
            message.error("Tạo nhóm thất bại")
            setLoading(false)
            return null
        }
    }

    return { createGroupChat, loading }
}

export default useCreateGroupChat
