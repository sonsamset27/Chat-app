import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────
const AuthContext = createContext(null)

// ──────────────────────────────────────────────
// Custom Hook
// ──────────────────────────────────────────────
export const useAuth = () => {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth phải được dùng bên trong <AuthProvider>')
    }

    return context
}

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
    // Firebase Auth user
    const [currentUser, setCurrentUser] = useState(null)

    // Firestore profile
    const [userProfile, setUserProfile] = useState(null)

    // Loading auth state
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let unsubscribeProfile = null

        // Lắng nghe trạng thái đăng nhập
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user)

            // Hủy listener profile cũ
            if (unsubscribeProfile) {
                unsubscribeProfile()
            }

            // Nếu logout
            if (!user) {
                setUserProfile(null)
                setLoading(false)
                return
            }

            // Realtime listener profile
            unsubscribeProfile = onSnapshot(
                doc(db, 'PROFILES', user.uid),

                // Success
                (snapshot) => {
                    if (snapshot.exists()) {
                        setUserProfile(snapshot.data())
                    } else {
                        setUserProfile(null)
                    }

                    setLoading(false)
                },

                // Error
                (error) => {
                    console.error('Profile snapshot error:', error)
                    setLoading(false)
                }
            )
        })

        // Cleanup
        return () => {
            unsubscribeAuth()

            if (unsubscribeProfile) {
                unsubscribeProfile()
            }
        }
    }, [])

    // Logout
    const logout = async () => {
        try {
            await signOut(auth)
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    // Context value
    const value = {
        currentUser,
        userProfile,
        setUserProfile,
        loading,
        logout,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export default AuthContext