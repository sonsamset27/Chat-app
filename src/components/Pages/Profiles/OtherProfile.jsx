import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Avatar, Button, Typography, Badge, Spin, Result } from 'antd'
import { MessageSquare, UserPlus, UserMinus, UserCheck, ShieldAlert, Shield, ArrowLeft } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { useAuth } from '../../../Context/AuthContext'
import useFriendship from '../../../hooks/useFriendship'
import MutualFriendList from './components/MutualFriendList'

const { Title, Text, Paragraph } = Typography

const OtherProfile = () => {
    const { uid } = useParams()
    const navigate = useNavigate()
    const { currentUser } = useAuth()

    const [profile, setProfile] = useState(null)
    const [loadingProfile, setLoadingProfile] = useState(true)
    const { friendship, loading: loadingFriendship, sendRequest, acceptRequest, rejectRequest, unfriend, blockUser, unblockUser } = useFriendship(uid)

    useEffect(() => {
        if (!uid) return
        if (uid === currentUser?.uid) {
            navigate('/profile')
            return
        }

        const fetchProfile = async () => {
            try {
                const docRef = doc(db, 'PROFILES', uid)
                const snap = await getDoc(docRef)
                if (snap.exists()) {
                    setProfile(snap.data())
                }
            } catch (err) {
                console.error("Error fetching profile:", err)
            } finally {
                setLoadingProfile(false)
            }
        }
        fetchProfile()
    }, [uid, currentUser, navigate])

    if (loadingProfile) return <div className="h-full flex items-center justify-center"><Spin size="large" /></div>
    if (!profile) return <Result status="404" title="Không tìm thấy người dùng" />

    const isPending = friendship?.status === 'pending'
    const isAccepted = friendship?.status === 'accepted'
    const isBlocked = friendship?.status === 'blocked'
    const amIRequester = friendship?.requesterId === currentUser?.uid
    const amIBlocker = friendship?.blockerId === currentUser?.uid

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#1a1b26] shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="flex flex-col gap-4 p-4 md:p-8 overflow-y-auto">

                {/* Back Button */}
                <div>
                    <Button
                        type="text"
                        icon={<ArrowLeft size={18} />}
                        className="flex items-center gap-2 text-gray-500 hover:text-[#5B5CE2] px-0 font-medium"
                        onClick={() => navigate(-1)}
                    >
                        Quay lại
                    </Button>
                </div>

                {/* Profile Info Card */}
                <Card
                    className="rounded-2xl md:rounded-3xl shadow-sm border-gray-100 dark:border-gray-800 transition-colors duration-300"
                >
                    <div className="p-1 md:p-2">
                        {/* Avatar + Info + Actions */}
                        {/* On mobile: stacks vertically centered */}
                        {/* On sm+: avatar & info on left, actions on right */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-5 mb-5">
                            {/* Left: Avatar + Name */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                                <Badge >
                                    <Avatar
                                        src={profile.avatar || undefined}
                                        size={{ xs: 72, sm: 80, md: 96 }}
                                        className="ring-4 ring-[#F8F9FE] dark:ring-[#1a1b26] bg-[#5B5CE2] transition-colors duration-300 shrink-0"
                                    >
                                        {profile.name?.charAt(0).toUpperCase()}
                                    </Avatar>
                                </Badge>
                                <div className="pt-0 sm:pt-2">
                                    <Title level={3} className="!mb-1 !text-xl md:!text-2xl">{profile.name}</Title>
                                    <Text type="secondary" className="text-sm flex items-center gap-1.5 justify-center sm:justify-start">
                                        <span className={`w-1.5 h-1.5 rounded-full ${profile.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        {profile.status === 'online' ? 'Đang hoạt động' : 'Ngoại tuyến'}
                                    </Text>
                                </div>
                            </div>

                            {/* Right: Action Buttons */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 shrink-0">
                                {isBlocked ? (
                                    amIBlocker ? (
                                        <Button
                                            danger
                                            icon={<Shield size={16} />}
                                            className="rounded-xl font-bold"
                                            onClick={unblockUser}
                                        >
                                            Bỏ chặn
                                        </Button>
                                    ) : (
                                        <Text type="danger" className="font-bold flex items-center gap-1">
                                            <ShieldAlert size={16} /> Bạn đã bị chặn
                                        </Text>
                                    )
                                ) : isAccepted ? (
                                    <>
                                        <Button
                                            type="primary"
                                            icon={<MessageSquare size={16} />}
                                            className="rounded-xl font-bold shadow-none"
                                            onClick={() => navigate('/chats')}
                                        >
                                            Nhắn tin
                                        </Button>
                                        <Button
                                            icon={<UserMinus size={16} />}
                                            className="rounded-xl font-bold"
                                            onClick={unfriend}
                                        >
                                            Hủy kết bạn
                                        </Button>
                                    </>
                                ) : isPending ? (
                                    amIRequester ? (
                                        <Button
                                            icon={<UserMinus size={16} />}
                                            className="rounded-xl font-bold"
                                            onClick={rejectRequest}
                                        >
                                            Hủy yêu cầu
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                type="primary"
                                                icon={<UserCheck size={16} />}
                                                className="rounded-xl font-bold shadow-none"
                                                onClick={acceptRequest}
                                            >
                                                Chấp nhận
                                            </Button>
                                            <Button
                                                icon={<UserMinus size={16} />}
                                                className="rounded-xl font-bold"
                                                onClick={rejectRequest}
                                            >
                                                Từ chối
                                            </Button>
                                        </>
                                    )
                                ) : (
                                    <Button
                                        type="primary"
                                        icon={<UserPlus size={16} />}
                                        className="rounded-xl font-bold shadow-none"
                                        onClick={sendRequest}
                                        loading={loadingFriendship}
                                    >
                                        Thêm bạn
                                    </Button>
                                )}

                                {!isBlocked && (
                                    <Button
                                        danger
                                        type="text"
                                        icon={<ShieldAlert size={16} />}
                                        className="rounded-xl"
                                        onClick={blockUser}
                                        title="Chặn người dùng"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <Title level={5} className="!mb-2">Tiểu sử</Title>
                            <Paragraph className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-0">
                                {profile.bio || 'Chưa có tiểu sử'}
                            </Paragraph>
                        </div>
                    </div>
                </Card>

                <MutualFriendList otherUid={uid} />
            </div>
        </div>
    )
}

export default OtherProfile