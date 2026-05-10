import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, getDocs, documentId } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../Context/AuthContext'

const useIncomingRequests = () => {
    const { currentUser } = useAuth()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!currentUser) {
            setLoading(false)
            return
        }

        const friendshipsRef = collection(db, 'FRIENDSHIPS')
        // Get all pending requests where this user is the receiver
        const q = query(
            friendshipsRef,
            where('status', '==', 'pending'),
            where('receiverId', '==', currentUser.uid)
        )

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            if (snapshot.empty) {
                setRequests([])
                setLoading(false)
                return
            }

            const requesterUids = snapshot.docs.map(doc => doc.data().requesterId)

            try {
                const profilesRef = collection(db, 'PROFILES')
                // Firestore 'in' query supports up to 30 items
                const profilesQuery = query(profilesRef, where('userId', 'in', requesterUids))
                const profilesSnapshot = await getDocs(profilesQuery)
                
                const profilesData = []
                profilesSnapshot.forEach(doc => {
                    profilesData.push(doc.data())
                })
                
                setRequests(profilesData)
            } catch (error) {
                console.error("Error fetching request profiles:", error)
            } finally {
                setLoading(false)
            }
        }, (error) => {
            console.error("Error listening to incoming requests:", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [currentUser])

    return { requests, loading }
}

export default useIncomingRequests
