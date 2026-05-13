import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, onSnapshot, orderBy, limit, limitToLast, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../Context/AuthContext'

const useMessages = (conversationId) => {
    const { currentUser } = useAuth()
    const [serverMessages, setServerMessages] = useState([])
    const [optimisticMessages, setOptimisticMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [msgLimit, setMsgLimit] = useState(30)
    const [hasMore, setHasMore] = useState(false)

    useEffect(() => {
        if (!conversationId) {
            setServerMessages([])
            setOptimisticMessages([])
            setLoading(false)
            setHasMore(false)
            return
        }

        if (serverMessages.length === 0) setLoading(true)

        const messagesRef = collection(db, 'MESSAGES')
        // We fetch messages for this conversation without orderBy to avoid Index requirement.
        // We will handle sorting and limiting in JS for 100% reliability.
        const q = query(
            messagesRef,
            where('conversationId', '==', conversationId)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            // 1. Sort all fetched messages by time
            const allSorted = fetched.sort((a, b) => {
                const t1 = a.createdAt?.toMillis() || Date.now()
                const t2 = b.createdAt?.toMillis() || Date.now()
                return t1 - t2
            })

            // 2. Only take the LAST 'msgLimit' messages (e.g., last 30)
            const limited = allSorted.slice(-msgLimit)

            setServerMessages(limited)
            setHasMore(allSorted.length > msgLimit)
            setLoading(false)
            setLoadingMore(false)

            // Clear optimistic messages
            setOptimisticMessages(prev => prev.filter(om =>
                !allSorted.find(m =>
                    m.senderId === om.senderId &&
                    (om.type === 'text' ? m.text === om.text : m.url === om.url)
                )
            ))
        }, (error) => {
            console.error("Error listening to messages:", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [conversationId, msgLimit])

    const loadMore = useCallback(() => {
        if (hasMore && !loadingMore) {
            setLoadingMore(true)
            setMsgLimit(prev => prev + 30)
        }
    }, [hasMore, loadingMore])

    // Combine server and optimistic messages
    const messages = [...serverMessages, ...optimisticMessages]

    const sendMessage = async (text, type = 'text', url = '') => {
        if ((!text.trim() && type === 'text') || !conversationId || !currentUser) return

        const clientMsgId = 'temp-' + Date.now()
        const newMessage = {
            id: clientMsgId,
            conversationId,
            senderId: currentUser.uid,
            type,
            text: type === 'text' ? text : '',
            url: type === 'image' ? url : '',
            createdAt: { toDate: () => new Date(), toMillis: () => Date.now() },
            isPending: true
        }

        // Add to optimistic state immediately
        setOptimisticMessages(prev => [...prev, newMessage])

        try {
            const messagesRef = collection(db, 'MESSAGES')
            const docData = {
                conversationId,
                senderId: currentUser.uid,
                type,
                text: type === 'text' ? text : '',
                url: type === 'image' ? url : '',
                createdAt: serverTimestamp()
            }

            const docRef = await addDoc(messagesRef, docData)

            const convRef = doc(db, 'CONVERSATIONS', conversationId)
            const convSnap = await getDoc(convRef)
            
            let unreadCount = {}
            if (convSnap.exists()) {
                const data = convSnap.data()
                unreadCount = data.unreadCount || {}
                // Increment for others
                data.participants?.forEach(uid => {
                    if (uid !== currentUser.uid) {
                        unreadCount[uid] = (unreadCount[uid] || 0) + 1
                    }
                })
            }

            await updateDoc(convRef, {
                lastMessageId: docRef.id,
                updatedAt: serverTimestamp(),
                unreadCount
            })
        } catch (error) {
            console.error("Error sending message:", error)
            setOptimisticMessages(prev => prev.filter(m => m.id !== clientMsgId))
        }
    }

    const deleteMessage = async (messageId) => {
        if (!messageId || !conversationId) return
        try {
            // 1. Delete the message
            const msgRef = doc(db, 'MESSAGES', messageId)
            await deleteDoc(msgRef)

            // 2. Check if we need to update the conversation's lastMessageId
            // We look at our local sorted messages to find the new last message
            const remainingMessages = messages.filter(m => m.id !== messageId)
            const newLastMessage = remainingMessages.length > 0
                ? remainingMessages[remainingMessages.length - 1]
                : null

            const convRef = doc(db, 'CONVERSATIONS', conversationId)
            await updateDoc(convRef, {
                lastMessageId: newLastMessage ? newLastMessage.id : null,
                updatedAt: serverTimestamp() // Refresh the list order
            })
        } catch (error) {
            console.error("Error deleting message:", error)
        }
    }

    return { messages, loading, loadingMore, loadMore, hasMore, sendMessage, deleteMessage }
}

export default useMessages
