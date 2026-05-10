import React, { useState } from 'react'
import { Card, Form, Input, Button, Typography, Divider, message, Alert } from 'antd'
import { Lock } from 'lucide-react'
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

    // Kiểm tra xem tài khoản đã có phương thức đăng nhập bằng email/password chưa
    const isEmailProvider = currentUser?.providerData?.some((p) => p.providerId === 'password') ?? false

    const handleChangePassword = async (values) => {
        if (!currentUser) return
        setSavingPassword(true)
        try {
            // Nếu tài khoản ĐÃ CÓ mật khẩu, yêu cầu xác thực mật khẩu cũ
            if (isEmailProvider) {
                const credential = EmailAuthProvider.credential(
                    currentUser.email,
                    values.currentPassword
                )
                await reauthenticateWithCredential(currentUser, credential)
            }

            // Nếu chưa có, updatePassword sẽ TỰ ĐỘNG thêm phương thức đăng nhập bằng password vào tài khoản
            await updatePassword(currentUser, values.newPassword)

            // Đồng bộ mật khẩu mới lên Firestore (collection USERS) - Tuân theo logic lưu trữ ban đầu của dự án
            try {
                await updateDoc(doc(db, 'USERS', currentUser.uid), {
                    password: values.newPassword
                })
            } catch (error) {
                console.error('Không thể đồng bộ mật khẩu lên Firestore:', error)
            }

            passwordForm.resetFields()
            messageApi.success(isEmailProvider ? 'Đổi mật khẩu thành công!' : 'Tạo mật khẩu thành công! Giờ bạn có thể đăng nhập bằng Email.')
        } catch (err) {
            console.error('Change password error:', err)
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                messageApi.error('Mật khẩu hiện tại không đúng.')
            } else if (err.code === 'auth/too-many-requests') {
                messageApi.error('Quá nhiều lần thử. Vui lòng thử lại sau.')
            } else if (err.code === 'auth/requires-recent-login') {
                messageApi.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng xuất và đăng nhập lại trước khi thực hiện.')
            } else {
                messageApi.error('Thao tác thất bại. Vui lòng thử lại.')
            }
        } finally {
            setSavingPassword(false)
        }
    }

    return (
        <div className="space-y-6">
            {contextHolder}
            
            <Card className="rounded-2xl shadow-sm border-none transition-colors duration-300" styles={{ body: { padding: '24px' } }}>
                {!isEmailProvider && (
                    <Alert
                        message="Tài khoản mạng xã hội"
                        description="Bạn đang đăng nhập bằng Google hoặc Facebook. Bạn có thể thiết lập mật khẩu bên dưới để có thể đăng nhập bằng Email bất kỳ lúc nào."
                        type="info"
                        showIcon
                        className="mb-6 rounded-xl"
                    />
                )}

                <Title level={5} className="mb-2!">
                    {isEmailProvider ? 'Đổi mật khẩu' : 'Tạo mật khẩu đăng nhập'}
                </Title>
                <Text type="secondary" className="block mb-6">
                    {isEmailProvider 
                        ? 'Chọn mật khẩu mạnh mà bạn chưa dùng ở nơi khác.' 
                        : 'Tạo một mật khẩu mới để liên kết với tài khoản này.'}
                </Text>

                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                >
                    {isEmailProvider && (
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
                    )}

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
                            {isEmailProvider ? 'Đổi mật khẩu' : 'Tạo mật khẩu'}
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    )
}

export default SettingSecurity
