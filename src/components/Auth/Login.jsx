import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, Mail, Lock } from 'lucide-react'
import { Form, Input, Button, Divider, Typography, Alert } from 'antd'

import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    fetchSignInMethodsForEmail,
    linkWithCredential,
    EmailAuthProvider,
    updatePassword,
} from 'firebase/auth'

import { auth, db } from '../../firebase/config'

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore'

const { Title, Text } = Typography

// ──────────────────────────────────────────────
// SET STATUS
// ──────────────────────────────────────────────
const setStatus = async (uid, status) => {
    try {
        await updateDoc(doc(db, 'PROFILES', uid), {
            status,
            lastSeen: serverTimestamp(),
        })
    } catch (error) {
        console.error('Set status error:', error)
    }
}

// ──────────────────────────────────────────────
// CREATE / UPDATE USER DATA
// ──────────────────────────────────────────────
const ensureUserDocs = async (user) => {
    const userRef = doc(db, 'USERS', user.uid)
    const profileRef = doc(db, 'PROFILES', user.uid)

    const [userSnap, profileSnap] = await Promise.all([
        getDoc(userRef),
        getDoc(profileRef),
    ])

    // USERS
    if (!userSnap.exists()) {
        await setDoc(userRef, {
            userId: user.uid,
            email: user.email ?? '',
            createdAt: serverTimestamp(),
        })
    }

    // Avatar xử lý riêng cho Facebook
    const isFacebook =
        user.providerData?.[0]?.providerId === 'facebook.com'

    const avatar = user.photoURL
        ? isFacebook
            ? `${user.photoURL}?type=large&width=500&height=500`
            : user.photoURL
        : ''

    // PROFILES
    await setDoc(
        profileRef,
        {
            userId: user.uid,
            name:
                user.displayName ||
                user.email?.split('@')[0] ||
                'Người dùng',

            bio: '',

            avatar,

            status: 'online',

            lastSeen: serverTimestamp(),
        },
        { merge: true }
    )
}

// ──────────────────────────────────────────────
// AUTO-RESTORE PASSWORD
// (Firebase tự động xóa password nếu email chưa xác minh khi login bằng Google.
//  Hàm này đọc password đã lưu ở Firestore để phục hồi lại phương thức đăng nhập bằng email)
// ──────────────────────────────────────────────
const autoRestorePassword = async (user) => {
    try {
        const hasPasswordProvider = user.providerData.some((p) => p.providerId === 'password')
        if (!hasPasswordProvider) {
            const userRef = doc(db, 'USERS', user.uid)
            const userSnap = await getDoc(userRef)
            const savedPassword = userSnap.data()?.password
            
            if (savedPassword) {
                await updatePassword(user, savedPassword)
            }
        }
    } catch (error) {
        console.error('Auto restore password error:', error)
    }
}

// ──────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────
const Login = () => {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    // ──────────────────────────────────────────
    // EMAIL / PASSWORD LOGIN
    // ──────────────────────────────────────────
    const onFinish = async (values) => {
        setError('')
        setLoading(true)

        try {
            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    values.email,
                    values.password
                )

            await ensureUserDocs(userCredential.user)

            await setStatus(userCredential.user.uid, 'online')

            navigate('/chats')
        } catch (err) {
            console.error('Login error:', err)

            setError('Email hoặc mật khẩu không chính xác')
        } finally {
            setLoading(false)
        }
    }

    // ──────────────────────────────────────────
    // GOOGLE LOGIN
    // ──────────────────────────────────────────
    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider()
        setError('')
        setLoading(true)

        try {
            const result = await signInWithPopup(auth, provider)
            await ensureUserDocs(result.user)
            await autoRestorePassword(result.user)
            navigate('/chats')
        } catch (err) {
            console.error('Google login error:', err)
            if (err.code === 'auth/account-exists-with-different-credential') {
                setError('Email này đã được đăng ký bằng phương thức khác. Vui lòng thử đăng nhập bằng Email/Mật khẩu hoặc Facebook.')
            } else {
                setError('Lỗi đăng nhập Google')
            }
        } finally {
            setLoading(false)
        }
    }

    // ──────────────────────────────────────────
    // FACEBOOK LOGIN
    // ──────────────────────────────────────────
    const handleFacebookLogin = async () => {
        const provider = new FacebookAuthProvider()
        provider.addScope('email')
        provider.addScope('public_profile')

        setError('')
        setLoading(true)

        try {
            const result = await signInWithPopup(auth, provider)
            await ensureUserDocs(result.user)
            await autoRestorePassword(result.user)
            navigate('/chats')
        } catch (err) {
            console.error('Facebook login error:', err)
            if (err.code === 'auth/account-exists-with-different-credential') {
                setError('Email này đã được đăng ký bằng phương thức khác. Vui lòng thử đăng nhập bằng Email/Mật khẩu hoặc Google.')
            } else {
                setError('Lỗi đăng nhập Facebook')
            }
        } finally {
            setLoading(false)
        }
    }

    // ──────────────────────────────────────────
    // UI
    // ──────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#F8F9FE] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-40">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-200 rounded-full blur-3xl"></div>

                <div className="absolute top-40 -right-20 w-80 h-80 bg-blue-200 rounded-full blur-3xl"></div>

                <div className="absolute -bottom-40 left-20 w-96 h-96 bg-pink-200 rounded-full blur-3xl"></div>
            </div>

            <div className="z-10 w-full max-w-md px-6">
                {/* LOGO */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#5B5CE2] to-[#7A7BF2] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#5B5CE2]/30">
                        <MessageSquare
                            className="text-white"
                            size={32}
                        />
                    </div>

                    <Title
                        level={2}
                        className="mb-1 text-gray-800"
                    >
                        HumanChat
                    </Title>

                    <Text className="text-sm text-gray-500">
                        Kết nối nhân văn trong từng tin nhắn
                    </Text>
                </div>

                {/* CARD */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">
                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            showIcon
                            className="mb-6 rounded-xl"
                        />
                    )}

                    {/* FORM */}
                    <Form
                        name="login"
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark={false}
                        size="large"
                    >
                        {/* EMAIL */}
                        <Form.Item
                            label={
                                <Text className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">
                                    Email
                                </Text>
                            }
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        'Vui lòng nhập email!',
                                },
                                {
                                    type: 'email',
                                    message:
                                        'Email không hợp lệ!',
                                },
                            ]}
                        >
                            <Input
                                prefix={
                                    <Mail
                                        size={18}
                                        className="text-gray-400 mr-2"
                                    />
                                }
                                placeholder="example@gmail.com"
                                className="rounded-xl bg-[#F8F9FE] border-gray-100 py-3"
                            />
                        </Form.Item>

                        {/* PASSWORD */}
                        <Form.Item
                            label={
                                <div className="flex justify-between w-full min-w-[320px]">
                                    <Text className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">
                                        Mật khẩu
                                    </Text>

                                    <Link
                                        to="#"
                                        className="text-xs text-[#5B5CE2] hover:underline font-medium"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                            }
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        'Vui lòng nhập mật khẩu!',
                                },
                            ]}
                            className="mb-8"
                        >
                            <Input.Password
                                prefix={
                                    <Lock
                                        size={18}
                                        className="text-gray-400 mr-2"
                                    />
                                }
                                placeholder="••••••••"
                                className="rounded-xl bg-[#F8F9FE] border-gray-100 py-3"
                            />
                        </Form.Item>

                        {/* LOGIN BUTTON */}
                        <Form.Item className="mb-6">
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full rounded-xl h-12 text-sm font-bold shadow-md shadow-[#5B5CE2]/30"
                                loading={loading}
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>
                    </Form>

                    {/* DIVIDER */}
                    <Divider className="text-[10px] font-bold text-gray-400 tracking-wider uppercase my-6">
                        Hoặc đăng nhập với
                    </Divider>

                    {/* SOCIAL LOGIN */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* GOOGLE */}
                        <Button
                            onClick={handleGoogleLogin}
                            loading={loading}
                            className="h-12 bg-[#EEF0FF] text-[#5B5CE2] border-none rounded-xl text-sm font-semibold hover:bg-blue-100 flex items-center justify-center gap-2"
                        >
                            <img
                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                className="w-5 h-5"
                                alt="Google"
                            />

                            Google
                        </Button>

                        {/* FACEBOOK */}
                        <Button
                            onClick={handleFacebookLogin}
                            loading={loading}
                            className="h-12 bg-[#1877F2] text-white border-none rounded-xl text-sm font-semibold hover:bg-blue-600 flex items-center justify-center gap-2"
                        >
                            <img
                                src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                                className="w-5 h-5 brightness-0 invert"
                                alt="Facebook"
                            />

                            Facebook
                        </Button>
                    </div>

                    {/* SIGNUP */}
                    <div className="text-center">
                        <Text className="text-sm text-gray-500">
                            Chưa có tài khoản?{' '}
                            <Link
                                to="/signup"
                                className="text-[#5B5CE2] font-semibold hover:underline"
                            >
                                Đăng ký ngay
                            </Link>
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login