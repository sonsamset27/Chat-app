import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, query, limit, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../Context/AuthContext'
const useFriendSuggestions = () => {
    const { currentUser } = useAuth()
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [allPotentialUsers, setAllPotentialUsers] = useState([])

    // Fetch pool of users once
    useEffect(() => {
        const fetchUsers = async () => {
            if (!currentUser) return
            
            try {
                // Fetch all friendships to filter them out
                const friendshipsRef = collection(db, 'FRIENDSHIPS')
                const [qSent, qReceived] = [
                    query(friendshipsRef, where('requesterId', '==', currentUser.uid)),
                    query(friendshipsRef, where('receiverId', '==', currentUser.uid))
                ]
                
                const [snapSent, snapReceived] = await Promise.all([
                    getDocs(qSent),
                    getDocs(qReceived)
                ])
                
                const relatedUids = new Set()
                snapSent.forEach(doc => relatedUids.add(doc.data().receiverId))
                snapReceived.forEach(doc => relatedUids.add(doc.data().requesterId))

                // Fetch pool of potential users
                const profilesRef = collection(db, 'PROFILES')
                const qPool = query(profilesRef, limit(50))
                const snapPool = await getDocs(qPool)
                
                const potentialUsers = []
                snapPool.forEach(doc => {
                    const data = doc.data()
                    if (data.userId !== currentUser.uid && !relatedUids.has(data.userId)) {
                        potentialUsers.push(data)
                    }
                })
                
                setAllPotentialUsers(potentialUsers)
            } catch (error) {
                console.error("Error fetching suggestions:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [currentUser])

    const shuffleAndPick = useCallback(() => {
        if (allPotentialUsers.length === 0) {
            setSuggestions([])
            return
        }
        
        // Fisher-Yates shuffle
        const shuffled = [...allPotentialUsers]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        
        // Pick top 3
        setSuggestions(shuffled.slice(0, 3))
    }, [allPotentialUsers])

    // Generate initial suggestions when pool is loaded
    useEffect(() => {
        if (allPotentialUsers.length > 0) {
            shuffleAndPick()
        }
    }, [allPotentialUsers, shuffleAndPick])

    const refreshSuggestions = () => {
        shuffleAndPick()
    }

    return {
        suggestions,
        loading,
        refreshSuggestions
    }
}

export default useFriendSuggestions
