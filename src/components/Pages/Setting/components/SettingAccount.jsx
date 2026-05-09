import React, { useState, useEffect, useRef } from 'react'
import { Card, Form, Input, Button, Typography, Divider, Space, Avatar, Modal, message } from 'antd'
import { Camera, Trash2 } from 'lucide-react'
import { useAuth } from '../../../../Context/AuthContext'
import { db, auth } from '../../../../firebase/config'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { doc, updateDoc } from 'firebase/firestore'
import { updateProfile, deleteUser } from 'firebase/auth'

const { Title, Text } = Typography
const storage = getStorage()

const SettingAccount = () => {
    const { currentUser, userProfile } = useAuth()
    const [profileForm] = Form.useForm()
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [avatarFile, setAvatarFile] = useState(null)
    const [savingProfile, setSavingProfile] = useState(false)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const fileInputRef = useRef(null)
    const [messageApi, contextHolder] = message.useMessage()

    useEffect(() => {
        if (userProfile || currentUser) {
            profileForm.setFieldsValue({
                name: userProfile?.name || currentUser?.displayName || '',
                bio: userProfile?.bio || '',
            })
        }
    }, [userProfile, currentUser, profileForm])

    const currentAvatarUrl = avatarPreview || userProfile?.avatar || currentUser?.photoURL || ''
    const displayName = userProfile?.name || currentUser?.displayName || 'Người dùng'

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            messageApi.error('Vui lòng chọn file ảnh!')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            messageApi.error('Ảnh không được vượt quá 5MB!')
            return
        }
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    const handleUploadAvatar = async () => {
        if (!avatarFile || !currentUser) return
        setUploadingAvatar(true)
        try {
            const path = `avatars/${currentUser.uid}`
            const ref = storageRef(storage, path)
            await uploadBytes(ref, avatarFile)
            const url = await getDownloadURL(ref)
            await updateDoc(doc(db, 'PROFILES', currentUser.uid), { avatar: url })
            setAvatarFile(null)
            messageApi.success('Ảnh đại diện đã được cập nhật!')
        } catch (err) {
            console.error('Upload avatar error:', err)
            messageApi.error('Tải ảnh thất bại. Vui lòng thử lại.')
        } finally {
            setUploadingAvatar(false)
        }
    }

    const handleDeleteAvatar = () => {
        Modal.confirm({
            title: 'Xóa ảnh đại diện',
            content: 'Bạn có chắc muốn xóa ảnh đại diện hiện tại không?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    setAvatarPreview(null)
                    setAvatarFile(null)

                    if (userProfile?.avatar?.includes('firebasestorage')) {
                        try {
                            const ref = storageRef(storage, `avatars/${currentUser.uid}`)
                            await deleteObject(ref)
                        } catch { /* ignore if not found */ }
                    }

                    await updateDoc(doc(db, 'PROFILES', currentUser.uid), { avatar: '' })
                    messageApi.success('Đã xóa ảnh đại diện.')
                } catch (err) {
                    console.error('Delete avatar error:', err)
                    messageApi.error('Xóa ảnh thất bại.')
                }
            },
        })
    }

    const handleSaveProfile = async (values) => {
        if (!currentUser) return
        setSavingProfile(true)
        try {
            if (avatarFile) await handleUploadAvatar()

            await updateDoc(doc(db, 'PROFILES', currentUser.uid), {
                name: values.name.trim(),
                bio: values.bio?.trim() || '',
            })
            await updateProfile(auth.currentUser, { displayName: values.name.trim() })
            messageApi.success('Lưu hồ sơ thành công!')
        } catch (err) {
            console.error('Save profile error:', err)
            messageApi.error('Lưu hồ sơ thất bại. Vui lòng thử lại.')
        } finally {
            setSavingProfile(false)
        }
    }

    const handleDeleteAccount = () => {
        Modal.confirm({
            title: 'Xóa tài khoản',
            content: (
                <div>
                    <p>Hành động này <strong>không thể hoàn tác</strong>. Toàn bộ dữ liệu của bạn sẽ bị xóa vĩnh viễn.</p>
                    <p>Bạn có chắc chắn muốn tiếp tục?</p>
                </div>
            ),
            okText: 'Xóa tài khoản',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await deleteUser(auth.currentUser)
                    messageApi.success('Tài khoản đã được xóa.')
                } catch (err) {
                    console.error('Delete account error:', err)
                    if (err.code === 'auth/requires-recent-login') {
                        messageApi.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại rồi thử.')
                    } else {
                        messageApi.error('Xóa tài khoản thất bại.')
                    }
                }
            },
        })
    }

    return (
        <div className="space-y-6">
            {contextHolder}
            <Card className="rounded-2xl shadow-sm border-none dark:bg-[#24283b] transition-colors duration-300" styles={{ body: { padding: '24px' } }}>
                <Title level={5} className="mb-6! dark:text-white">Hồ sơ công khai</Title>

                <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                        <Avatar
                            src={currentAvatarUrl || undefined}
                            size={80}
                            className="bg-[#5B5CE2] ring-4 ring-[#F8F9FE] dark:ring-[#1a1b26] transition-colors duration-300"
                        >
                            {displayName.charAt(0).toUpperCase()}
                        </Avatar>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#5B5CE2] rounded-full flex items-center justify-center cursor-pointer border-2 border-white dark:border-[#24283b] shadow-md hover:bg-[#4a4bd4] transition-colors"
                        >
                            <Camera size={13} className="text-white" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    <Space size="middle" wrap>
                        {avatarFile ? (
                            <Button
                                type="primary"
                                className="rounded-xl shadow-none font-medium"
                                onClick={handleUploadAvatar}
                                loading={uploadingAvatar}
                            >
                                Lưu ảnh mới
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                className="rounded-xl shadow-none font-medium"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Thay đổi ảnh
                            </Button>
                        )}
                        {avatarFile && (
                            <Button
                                className="rounded-xl font-medium text-gray-600 dark:text-gray-300"
                                onClick={() => { setAvatarFile(null); setAvatarPreview(null) }}
                            >
                                Hủy
                            </Button>
                        )}
                        {!avatarFile && currentAvatarUrl && (
                            <Button
                                className="rounded-xl font-medium text-gray-600 dark:text-gray-300"
                                icon={<Trash2 size={14} />}
                                onClick={handleDeleteAvatar}
                            >
                                Xóa ảnh
                            </Button>
                        )}
                    </Space>
                </div>

                <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={handleSaveProfile}
                >
                    <Form.Item
                        label={<span className="dark:text-gray-300">Họ và tên</span>}
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                    >
                        <Input size="large" className="rounded-xl bg-[#F8F9FE] dark:bg-[#1a1b26] border-gray-100 dark:border-gray-800 dark:text-white transition-colors duration-300" />
                    </Form.Item>
                    <Form.Item label={<span className="dark:text-gray-300">Email</span>}>
                        <Input
                            size="large"
                            value={currentUser?.email || ''}
                            disabled
                            className="rounded-xl bg-[#F8F9FE] dark:bg-[#1a1b26] border-gray-100 dark:border-gray-800 dark:text-gray-400 transition-colors duration-300"
                        />
                    </Form.Item>
                    <Form.Item label={<span className="dark:text-gray-300">Tiểu sử</span>} name="bio">
                        <Input.TextArea
                            rows={4}
                            className="rounded-xl bg-[#F8F9FE] dark:bg-[#1a1b26] border-gray-100 dark:border-gray-800 dark:text-white resize-none transition-colors duration-300"
                            placeholder="Viết một chút về bản thân bạn..."
                            maxLength={200}
                            showCount
                        />
                    </Form.Item>
                    <Divider className="dark:border-gray-700" />
                    <div className="flex justify-end">
                        <Button
                            type="primary"
                            size="large"
                            htmlType="submit"
                            loading={savingProfile}
                            className="rounded-xl px-8 font-bold shadow-md shadow-[#5B5CE2]/20"
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </Form>
            </Card>

            <Card
                className="rounded-2xl shadow-sm border-red-100 dark:border-red-900 dark:bg-[#24283b] transition-colors duration-300"
                styles={{ body: { padding: '24px' } }}
            >
                <Title level={5} className="mb-2! text-red-500">Xóa tài khoản</Title>
                <Text className="block mb-4 text-gray-500 dark:text-gray-400">
                    Một khi bạn xóa tài khoản của mình, không thể khôi phục lại dữ liệu. Hãy chắc chắn.
                </Text>
                <Button
                    danger
                    className="rounded-xl font-medium"
                    onClick={handleDeleteAccount}
                >
                    Xóa tài khoản của tôi
                </Button>
            </Card>
        </div>
    )
}

export default SettingAccount
