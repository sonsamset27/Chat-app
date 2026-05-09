import React, { useState } from 'react'
import { Card, Form, Input, Button, Typography, Divider, message } from 'antd'
import { Shield, Lock } from 'lucide-react'
import { useAuth } from '../../../../Context/AuthContext'
import { db } from '../../../../firebase/config'
import { doc, updateDoc } from 'firebase/firestore'
import {
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword,
} from 'firebase/auth'

const { Title, Text } = Typography

const SettingSecurity = () => {
    const { currentUser } = useAuth()
    const [passwordForm] = Form.useForm()
    const [savingPassword, setSavingPassword] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()

    const isEmailProvider = currentUser?.providerData?.some((p) => p.providerId === 'password') ?? false

    const handleChangePassword = async (values) => {
        if (!currentUser || !isEmailProvider) return
        setSavingPassword(true)
        try {
            const credential = EmailAuthProvider.credential(
                currentUser.email,
                values.currentPassword
            )
            await reauthenticateWithCredential(currentUser, credential)
            await updatePassword(currentUser, values.newPassword)

            // Đồng bộ mật khẩu mới lên Firestore (collection USERS)
            try {
                await updateDoc(doc(db, 'USERS', currentUser.uid), {
                    password: values.newPassword
                })
            } catch (error) {
                console.error('Không thể đồng bộ mật khẩu lên Firestore:', error)
            }

            passwordForm.resetFields()
            messageApi.success('Đổi mật khẩu thành công!')
        } catch (err) {
            console.error('Change password error:', err)
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                messageApi.error('Mật khẩu hiện tại không đúng.')
            } else if (err.code === 'auth/too-many-requests') {
                messageApi.error('Quá nhiều lần thử. Vui lòng thử lại sau.')
            } else {
                messageApi.error('Đổi mật khẩu thất bại. Vui lòng thử lại.')
            }
        } finally {
            setSavingPassword(false)
        }
    }

    return (
        <div className="space-y-6">
            {contextHolder}
            {isEmailProvider ? (
                <Card className="rounded-2xl shadow-sm border-none transition-colors duration-300" styles={{ body: { padding: '24px' } }}>
                    <Title level={5} className="mb-2!">Đổi mật khẩu</Title>
                    <Text type="secondary" className="block mb-6">
                        Chọn mật khẩu mạnh mà bạn chưa dùng ở nơi khác.
                    </Text>

                    <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handleChangePassword}
                    >
                        <Form.Item
                            label="Mật khẩu hiện tại"
                            name="currentPassword"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                        >
                            <Input.Password
                                size="large"
                                className="rounded-xl bg-[#F8F9FE] dark:bg-[#1a1b26] border-gray-100 dark:border-gray-800 transition-colors duration-300"
                                placeholder="••••••••"
                                prefix={<Lock size={16} className="text-gray-400 mr-1" />}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu mới"
                            name="newPassword"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                            ]}
                        >
                            <Input.Password
                                size="large"
                                className="rounded-xl bg-[#F8F9FE] dark:bg-[#1a1b26] border-gray-100 dark:border-gray-800 transition-colors duration-300"
                                placeholder="••••••••"
                                prefix={<Lock size={16} className="text-gray-400 mr-1" />}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Xác nhận mật khẩu mới"
                            name="confirmPassword"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve()
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'))
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                size="large"
                                className="rounded-xl bg-[#F8F9FE] dark:bg-[#1a1b26] border-gray-100 dark:border-gray-800 transition-colors duration-300"
                                placeholder="••••••••"
                                prefix={<Lock size={16} className="text-gray-400 mr-1" />}
                            />
                        </Form.Item>

                        <Divider className="dark:border-gray-700" />
                        <div className="flex justify-end">
                            <Button
                                type="primary"
                                size="large"
                                htmlType="submit"
                                loading={savingPassword}
                                className="rounded-xl px-8 font-bold shadow-md shadow-[#5B5CE2]/20"
                            >
                                Đổi mật khẩu
                            </Button>
                        </div>
                    </Form>
                </Card>
            ) : (
                <Card className="rounded-2xl shadow-sm border-none transition-colors duration-300" styles={{ body: { padding: '24px' } }}>
                    <div className="flex flex-col items-center py-10 text-center">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                            <Shield size={28} className="text-[#5B5CE2]" />
                        </div>
                        <Title level={4} className="mb-2!">Đăng nhập qua mạng xã hội</Title>
                        <Text type="secondary">
                            Tài khoản của bạn được bảo mật bởi Google/Facebook.
                            Quản lý mật khẩu trực tiếp trên dịch vụ đó.
                        </Text>
                    </div>
                </Card>
            )}
        </div>
    )
}

export default SettingSecurity
