import { useState, useEffect } from 'react'
import { doc, updateDoc, arrayUnion, arrayRemove, getDocs, collection, query, where, documentId, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { message } from 'antd'
import { useAuth } from '../Context/AuthContext'

const useGroupManagement = (conversationId, participantIds) => {
    const { currentUser } = useAuth()
    const [members, setMembers] = useState([])
    const [loadingMembers, setLoadingMembers] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    // Fetch member profiles whenever participantIds changes
    useEffect(() => {
        const fetchMembers = async () => {
            if (!participantIds || participantIds.length === 0) {
                setMembers([])
                setLoadingMembers(false)
                return
            }

            setLoadingMembers(true)
            try {
                const profilesRef = collection(db, 'PROFILES')
                // Firestore 'in' query has a limit of 30 items. We assume groups are < 30 members for this app.
                // If larger, we would need to batch queries.
                const batches = []
                for (let i = 0; i < participantIds.length; i += 30) {
                    const batchUids = participantIds.slice(i, i + 30)
                    batches.push(getDocs(query(profilesRef, where(documentId(), 'in', batchUids))))
                }

                const results = await Promise.all(batches)
                const membersData = []
                results.forEach(res => {
                    res.docs.forEach(doc => {
                        membersData.push({ id: doc.id, ...doc.data() })
                    })
                })
                setMembers(membersData)
            } catch (error) {
                console.error("Error fetching group members:", error)
            } finally {
                setLoadingMembers(false)
            }
        }

        fetchMembers()
    }, [participantIds])

    const addMembers = async (newUids) => {
        if (!newUids || newUids.length === 0) return false
        setActionLoading(true)
        try {
            const convRef = doc(db, 'CONVERSATIONS', conversationId)
            // Initialize unread count for new members to 0 using dot notation
            const updates = {
                participants: arrayUnion(...newUids)
            }
            // We can't use arrayUnion and object updates recursively in one go easily without knowing existing state.
            // But updating participants is the primary goal. 
            // Unread counts will be created when a new message is sent.
            
            await updateDoc(convRef, updates)

            // Add system message
            const sysMsgRef = await addDoc(collection(db, 'MESSAGES'), {
                conversationId: conversationId,
                senderId: 'system',
                type: 'system',
                text: `${currentUser.displayName || currentUser.name || 'Một người'} đã thêm ${newUids.length} người vào nhóm`,
                createdAt: serverTimestamp()
            })

            // Update conversation with last message
            await updateDoc(convRef, {
                lastMessageId: sysMsgRef.id,
                updatedAt: serverTimestamp()
            })

            message.success("Đã thêm thành viên mới")
            setActionLoading(false)
            return true
        } catch (error) {
            console.error("Error adding members:", error)
            message.error("Thêm thành viên thất bại")
            setActionLoading(false)
            return false
        }
    }

    const removeMember = async (uid, memberName = 'Một người') => {
        setActionLoading(true)
        try {
            const convRef = doc(db, 'CONVERSATIONS', conversationId)
            await updateDoc(convRef, {
                participants: arrayRemove(uid)
            })

            // Add system message
            const sysMsgRef = await addDoc(collection(db, 'MESSAGES'), {
                conversationId: conversationId,
                senderId: 'system',
                type: 'system',
                text: `${currentUser.displayName || currentUser.name || 'Một người'} đã xóa ${memberName} khỏi nhóm`,
                createdAt: serverTimestamp()
            })

            // Update conversation with last message
            await updateDoc(convRef, {
                lastMessageId: sysMsgRef.id,
                updatedAt: serverTimestamp()
            })

            message.success("Đã xóa thành viên")
            setActionLoading(false)
            return true
        } catch (error) {
            console.error("Error removing member:", error)
            message.error("Xóa thành viên thất bại")
            setActionLoading(false)
            return false
        }
    }

    return {
        members,
        loadingMembers,
        actionLoading,
        addMembers,
        removeMember
    }
}

export default useGroupManagement
