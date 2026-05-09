import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, Mail, Lock, User } from 'lucide-react'
import { Form, Input, Button, Typography, Alert } from 'antd'
import {
    createUserWithEmailAndPassword,
    updateProfile,
} from 'firebase/auth'
import { auth, db } from '../../firebase/config'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

const { Title, Text } = Typography

// ──────────────────────────────────────────────
// Helpers: lưu USERS + PROFILES lên Firestore
// ──────────────────────────────────────────────

/**
 * Lưu document vào collection USERS.
 * password chỉ lưu cho đăng ký email/password; OAuth để chuỗi rỗng.
 * Nếu document đã tồn tại (user đã đăng ký qua Google/Facebook trước đó) thì bỏ qua.
 */
const saveUser = async (uid, email, password = '') => {
    const ref = doc(db, 'USERS', uid)
    const snap = await getDoc(ref)
    if (snap.exists()) return          // đã có → không ghi đè
    await setDoc(ref, {
        userId: uid,
        email: email ?? '',
        password,               // lưu plaintext theo yêu cầu; thực tế nên hash
        createdAt: serverTimestamp(),
    })
}

/**
 * Lưu document vào collection PROFILES.
 * Chỉ tạo nếu chưa tồn tại (tránh ghi đè khi đăng nhập lại).
 */
const saveProfile = async (uid, name, avatarUrl = '', email = '') => {
    const ref = doc(db, 'PROFILES', uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
        await setDoc(ref, {
            userId: uid,
            name: name || email.split('@')[0] || 'Người dùng',
            bio: '',
            avatar: avatarUrl || '',
            status: 'online',
            lastSeen: serverTimestamp(),
        })
    }
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
const SignUp = () => {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    // ── Đăng ký bằng email / password ──────────
    const onFinish = async (values) => {
        setError('')
        setLoading(true)
        try {
            const { user } = await createUserWithEmailAndPassword(
                auth,
                values.email,
                values.password
            )

            // Cập nhật displayName trong Firebase Auth
            await updateProfile(user, { displayName: values.name })

            // Lưu vào Firestore
            await saveUser(user.uid, values.email, values.password)
            await saveProfile(user.uid, values.name, '', values.email)

            navigate('/chats')
        } catch (err) {
            console.error('Đăng ký lỗi:', err)
            if (err.code === 'auth/email-already-in-use') {
                setError('Email này đã được sử dụng. Vui lòng đăng nhập.')
            } else {
                setError('Đăng ký thất bại. Vui lòng thử lại.')
            }
        } finally {
            setLoading(false)
        }
    }

    // ── UI ──────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#F8F9FE] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-40">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                <div className="absolute top-40 -right-20 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                <div className="absolute -bottom-40 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            </div>

            <div className="z-10 w-full max-w-md px-6 my-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-linear-to-br from-[#5B5CE2] to-[#7A7BF2] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#5B5CE2]/30">
                        <MessageSquare className="text-white" size={32} />
                    </div>
                    <Title level={2} className="mb-1! text-gray-800">Tạo tài khoản</Title>
                    <Text className="text-sm text-gray-500">Tham gia cộng đồng HumanChat ngay hôm nay</Text>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">
                    {error && (
                        <Alert message={error} type="error" showIcon className="mb-6 rounded-xl" />
                    )}

                    <Form
                        name="signup"
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark={false}
                        size="large"
                    >
                        <Form.Item
                            label={<Text className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Họ và tên</Text>}
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                        >
                            <Input
                                prefix={<User size={18} className="text-gray-400 mr-2" />}
                                placeholder="Tên của bạn"
                                className="rounded-xl bg-[#F8F9FE] border-gray-100 py-3"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<Text className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Email</Text>}
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' },
                            ]}
                        >
                            <Input
                                prefix={<Mail size={18} className="text-gray-400 mr-2" />}
                                placeholder="example@gmail.com"
                                className="rounded-xl bg-[#F8F9FE] border-gray-100 py-3"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<Text className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Mật khẩu</Text>}
                            name="password"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                            ]}
                            className="mb-8"
                        >
                            <Input.Password
                                prefix={<Lock size={18} className="text-gray-400 mr-2" />}
                                placeholder="••••••••"
                                className="rounded-xl bg-[#F8F9FE] border-gray-100 py-3"
                            />
                        </Form.Item>

                        <Form.Item className="mb-6">
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full rounded-xl h-12 text-sm font-bold shadow-md shadow-[#5B5CE2]/30"
                                loading={loading}
                            >
                                Đăng ký
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="text-center">
                        <Text className="text-sm text-gray-500">
                            Đã có tài khoản? <Link to="/login" className="text-[#5B5CE2] font-semibold hover:underline">Đăng nhập ngay</Link>
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUp