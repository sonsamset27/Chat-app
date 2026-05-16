import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy, startAt, endAt, doc, setDoc, getDoc, serverTimestamp, limit } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../Context/AuthContext'

const useSearchUsers = () => {
    const { currentUser } = useAuth()
    const [searchResults, setSearchResults] = useState([])
    const [recentSearches, setRecentSearches] = useState([])
    const [loading, setLoading] = useState(false)

    // Load recent searches on mount
    useEffect(() => {
        if (!currentUser) return
        
        const fetchRecent = async () => {
            try {
                // Fetch up to 10 recent searches
                const recentRef = collection(db, `USERS/${currentUser.uid}/RECENT_SEARCHES`)
                const q = query(recentRef, orderBy('timestamp', 'desc'), limit(10))
                const snapshot = await getDocs(q)
                
                if (snapshot.empty) {
                    setRecentSearches([])
                    return
                }

                // Get target UIDs
                const targetUids = snapshot.docs.map(doc => doc.id)
                
                // Fetch profiles for these UIDs
                const profilesRef = collection(db, 'PROFILES')
                // Note: 'in' query is limited to 30, which is fine here since limit is 10
                const profilesQuery = query(profilesRef, where('userId', 'in', targetUids))
                const profilesSnapshot = await getDocs(profilesQuery)
                
                const profilesData = []
                profilesSnapshot.forEach(doc => {
                    profilesData.push(doc.data())
                })

                // Sort profiles to match the recent searches order
                const sortedRecent = targetUids.map(uid => profilesData.find(p => p.userId === uid)).filter(Boolean)
                setRecentSearches(sortedRecent)
            } catch (error) {
                console.error("Error fetching recent searches:", error)
            }
        }

        fetchRecent()
    }, [currentUser])

    const searchUsers = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setSearchResults([])
            return
        }

        setLoading(true)
        try {
            const profilesRef = collection(db, 'PROFILES')
            // Fetch all profiles and filter client-side for true case-insensitive substring search
            const snapshot = await getDocs(profilesRef)
            const results = []
            const lowerQuery = searchQuery.toLowerCase()
            
            snapshot.forEach(doc => {
                const data = doc.data()
                if (data.userId !== currentUser?.uid) {
                    const matchName = (data.name || data.displayName || '').toLowerCase()
                    const matchEmail = (data.email || '').toLowerCase()
                    if (matchName.includes(lowerQuery) || matchEmail.includes(lowerQuery)) {
                        results.push(data)
                    }
                }
            })
            setSearchResults(results)
        } catch (error) {
            console.error("Error searching users:", error)
        } finally {
            setLoading(false)
        }
    }

    const saveRecentSearch = async (targetUid) => {
        if (!currentUser || targetUid === currentUser.uid) return
        
        try {
            const recentRef = doc(db, `USERS/${currentUser.uid}/RECENT_SEARCHES`, targetUid)
            await setDoc(recentRef, {
                timestamp: serverTimestamp()
            })
            // Update local state by pushing to top
            // To do this properly, we need the target profile. 
            // We can just rely on the next unmount/remount, or fetch it specifically if needed.
        } catch (error) {
            console.error("Error saving recent search:", error)
        }
    }

    return {
        searchResults,
        recentSearches,
        loading,
        searchUsers,
        saveRecentSearch
    }
}

export default useSearchUsers
