import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Avatar, Button, Typography, Space, Badge, Spin, Result } from 'antd'
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

    const handleMessage = () => {
        navigate('/chats')
    }

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#1a1b26] rounded-tl-[30px] shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="flex flex-col gap-3 p-8 overflow-y-auto">
                {/* Back Button */}
                <div className="mb-4">
                    <Button 
                        type="text" 
                        icon={<ArrowLeft size={20} />} 
                        className="flex items-center gap-2 text-gray-500 hover:text-[#5B5CE2] px-0 font-medium"
                        onClick={() => navigate(-1)}
                    >
                        Quay lại
                    </Button>
                </div>

                <Card className="rounded-3xl shadow-sm mb-6 border-gray-100 dark:border-gray-800 transition-colors duration-300" styles={{ body: { padding: '32px' } }}>
                    <div className="flex justify-between items-start mb-6">
                        <Space size="large" align="start">
                            <Badge dot status={profile.status === 'online' ? 'success' : 'default'} offset={[-8, 85]}>
                                <Avatar 
                                    src={profile.avatar || undefined} 
                                    size={96} 
                                    className="ring-4 ring-[#F8F9FE] dark:ring-[#1a1b26] bg-[#5B5CE2] transition-colors duration-300"
                                >
                                    {profile.name?.charAt(0).toUpperCase()}
                                </Avatar>
                            </Badge>
                            <div className="pt-2">
                                <Title level={3} className="mb-1!">{profile.name}</Title>
                                <Text type="secondary" className="text-sm">
                                    {profile.status === 'online' ? 'Đang hoạt động' : 'Ngoại tuyến'}
                                </Text>
                            </div>
                        </Space>

                        <Space>
                            {isBlocked ? (
                                amIBlocker ? (
                                    <Button 
                                        danger 
                                        icon={<Shield size={18} />} 
                                        className="rounded-xl font-bold"
                                        onClick={unblockUser}
                                    >
                                        Bỏ chặn
                                    </Button>
                                ) : (
                                    <Text type="danger" className="font-bold flex items-center gap-1">
                                        <ShieldAlert size={18} /> Bạn đã bị chặn
                                    </Text>
                                )
                            ) : isAccepted ? (
                                <>
                                    <Button 
                                        type="primary" 
                                        icon={<MessageSquare size={18} />} 
                                        className="rounded-xl font-bold shadow-none"
                                        onClick={handleMessage}
                                    >
                                        Nhắn tin
                                    </Button>
                                    <Button 
                                        icon={<UserMinus size={18} />} 
                                        className="rounded-xl font-bold"
                                        onClick={unfriend}
                                    >
                                        Hủy kết bạn
                                    </Button>
                                </>
                            ) : isPending ? (
                                amIRequester ? (
                                    <Button 
                                        icon={<UserMinus size={18} />} 
                                        className="rounded-xl font-bold"
                                        onClick={rejectRequest}
                                    >
                                        Hủy yêu cầu
                                    </Button>
                                ) : (
                                    <>
                                        <Button 
                                            type="primary" 
                                            icon={<UserCheck size={18} />} 
                                            className="rounded-xl font-bold shadow-none"
                                            onClick={acceptRequest}
                                        >
                                            Chấp nhận
                                        </Button>
                                        <Button 
                                            icon={<UserMinus size={18} />} 
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
                                    icon={<UserPlus size={18} />} 
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
                                    icon={<ShieldAlert size={18} />} 
                                    className="rounded-xl"
                                    onClick={blockUser}
                                />
                            )}
                        </Space>
                    </div>

                    <div>
                        <Title level={5} className="mb-2!">Tiểu sử</Title>
                        <Paragraph className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-0">
                            {profile.bio || 'Chưa có tiểu sử'}
                        </Paragraph>
                    </div>
                </Card>

                <MutualFriendList otherUid={uid} />
            </div>
        </div>
    )
}

export default OtherProfile