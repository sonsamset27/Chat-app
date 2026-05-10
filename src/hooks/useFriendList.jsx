import { useState, useEffect } from 'react'
import { collection, query, or, where, getDocs, onSnapshot, documentId } from 'firebase/firestore'
import { db } from '../firebase/config'

const useFriendList = (uid) => {
    const [friends, setFriends] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!uid) {
            setLoading(false)
            return
        }

        const friendshipsRef = collection(db, 'FRIENDSHIPS')

        const q1 = query(
            friendshipsRef,
            where('status', '==', 'accepted'),
            where('requesterId', '==', uid)
        )
        const q2 = query(
            friendshipsRef,
            where('status', '==', 'accepted'),
            where('receiverId', '==', uid)
        )

        const fetchFriends = async (snapshot1, snapshot2) => {
            const friendUids = new Set()
            snapshot1.forEach(doc => friendUids.add(doc.data().receiverId))
            snapshot2.forEach(doc => friendUids.add(doc.data().requesterId))

            const uids = Array.from(friendUids)
            if (uids.length === 0) {
                setFriends([])
                setLoading(false)
                return
            }

            try {
                const profilesRef = collection(db, 'PROFILES')
                const batches = []
                for (let i = 0; i < uids.length; i += 30) {
                    const batchUids = uids.slice(i, i + 30)
                    batches.push(getDocs(query(profilesRef, where(documentId(), 'in', batchUids))))
                }

                const results = await Promise.all(batches)
                const friendsData = []
                results.forEach(res => {
                    res.docs.forEach(doc => {
                        friendsData.push({ id: doc.id, ...doc.data() })
                    })
                })
                setFriends(friendsData)
            } catch (error) {
                console.error("Error fetching friend profiles:", error)
            } finally {
                setLoading(false)
            }
        }

        let snap1 = null
        let snap2 = null

        const unsub1 = onSnapshot(q1, (s) => {
            snap1 = s
            if (snap2) fetchFriends(snap1, snap2)
        })
        const unsub2 = onSnapshot(q2, (s) => {
            snap2 = s
            if (snap1) fetchFriends(snap1, snap2)
        })

        return () => {
            unsub1()
            unsub2()
        }
    }, [uid])

    return { friends, loading }
}

export default useFriendList
