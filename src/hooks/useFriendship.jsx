import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../Context/AuthContext'
import { message } from 'antd'

const useFriendship = (otherUid) => {
    const { currentUser } = useAuth()
    const [friendship, setFriendship] = useState(null)
    const [loading, setLoading] = useState(true)

    // Generate composite ID based on alphabetical order to ensure uniqueness
    const getFriendshipId = (uid1, uid2) => {
        return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`
    }

    useEffect(() => {
        if (!currentUser || !otherUid) {
            setLoading(false)
            return
        }

        const friendshipId = getFriendshipId(currentUser.uid, otherUid)
        const docRef = doc(db, 'FRIENDSHIPS', friendshipId)

        const unsubscribe = onSnapshot(docRef, (snapshot) => {
            if (snapshot.exists()) {
                setFriendship({ id: snapshot.id, ...snapshot.data() })
            } else {
                setFriendship(null)
            }
            setLoading(false)
        }, (error) => {
            console.error("Error listening to friendship:", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [currentUser, otherUid])

    const sendRequest = async () => {
        if (!currentUser || !otherUid) return
        const friendshipId = getFriendshipId(currentUser.uid, otherUid)
        const docRef = doc(db, 'FRIENDSHIPS', friendshipId)
        
        try {
            await setDoc(docRef, {
                requesterId: currentUser.uid,
                receiverId: otherUid,
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            })
            message.success('Đã gửi yêu cầu kết bạn')
        } catch (error) {
            console.error("Error sending friend request:", error)
            message.error('Có lỗi xảy ra khi gửi yêu cầu')
        }
    }

    const acceptRequest = async () => {
        if (!currentUser || !otherUid || !friendship) return
        const docRef = doc(db, 'FRIENDSHIPS', friendship.id)
        
        try {
            await updateDoc(docRef, {
                status: 'accepted',
                updatedAt: serverTimestamp()
            })
            message.success('Đã chấp nhận kết bạn')
        } catch (error) {
            console.error("Error accepting friend request:", error)
            message.error('Có lỗi xảy ra khi chấp nhận yêu cầu')
        }
    }

    const rejectRequest = async () => {
        if (!currentUser || !otherUid || !friendship) return
        const docRef = doc(db, 'FRIENDSHIPS', friendship.id)
        
        try {
            await deleteDoc(docRef)
        } catch (error) {
            console.error("Error rejecting friend request:", error)
            message.error('Có lỗi xảy ra khi từ chối yêu cầu')
        }
    }

    const unfriend = async () => {
        if (!currentUser || !otherUid || !friendship) return
        const docRef = doc(db, 'FRIENDSHIPS', friendship.id)
        
        try {
            await deleteDoc(docRef)
            message.success('Đã hủy kết bạn')
        } catch (error) {
            console.error("Error unfriending:", error)
            message.error('Có lỗi xảy ra khi hủy kết bạn')
        }
    }

    const blockUser = async () => {
        if (!currentUser || !otherUid) return
        const friendshipId = getFriendshipId(currentUser.uid, otherUid)
        const docRef = doc(db, 'FRIENDSHIPS', friendshipId)
        
        try {
            await setDoc(docRef, {
                requesterId: friendship?.requesterId || currentUser.uid,
                receiverId: friendship?.receiverId || otherUid,
                status: 'blocked',
                blockerId: currentUser.uid,
                createdAt: friendship?.createdAt || serverTimestamp(),
                updatedAt: serverTimestamp()
            }, { merge: true }) // Merge in case document already exists
            message.success('Đã chặn người dùng')
        } catch (error) {
            console.error("Error blocking user:", error)
            message.error('Có lỗi xảy ra khi chặn')
        }
    }

    const unblockUser = async () => {
        if (!currentUser || !otherUid || !friendship) return
        const docRef = doc(db, 'FRIENDSHIPS', friendship.id)
        
        try {
            await deleteDoc(docRef)
            message.success('Đã bỏ chặn người dùng')
        } catch (error) {
            console.error("Error unblocking user:", error)
            message.error('Có lỗi xảy ra khi bỏ chặn')
        }
    }

    return {
        friendship,
        loading,
        sendRequest,
        acceptRequest,
        rejectRequest, // can be used for cancelling a sent request too
        unfriend,
        blockUser,
        unblockUser
    }
}

export default useFriendship
