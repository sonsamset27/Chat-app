import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../Context/AuthContext'

const useConversations = () => {
    const { currentUser } = useAuth()
    const [conversations, setConversations] = useState([])
    const [totalUnread, setTotalUnread] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!currentUser) {
            setLoading(false)
            return
        }

        const convRef = collection(db, 'CONVERSATIONS')
        const q = query(
            convRef,
            where('participants', 'array-contains', currentUser.uid)
            // orderBy('updatedAt', 'desc') // Removed to avoid index issues
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            
            // Sort in JavaScript
            const sorted = convData.sort((a, b) => {
                const t1 = a.updatedAt?.toMillis() || 0
                const t2 = b.updatedAt?.toMillis() || 0
                return t2 - t1
            })
            
            const totalUnread = sorted.reduce((sum, conv) => {
                return sum + (conv.unreadCount?.[currentUser.uid] || 0)
            }, 0)
            
            setConversations(sorted)
            setTotalUnread(totalUnread)
            setLoading(false)
        }, (error) => {
            console.error("Error listening to conversations:", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [currentUser])

    return { conversations, loading, totalUnread }
}

export default useConversations
