import React from 'react'
import { Card, Avatar, Button, Input, Tag, Typography, Badge, Row, Col, Space } from 'antd'
import { Search as SearchIcon, Bell, MoreVertical, MessageSquarePlus } from 'lucide-react'

const { Title, Text, Paragraph } = Typography

const Search = () => {
    return (
        <div className="h-full flex flex-col bg-white rounded-tl-[30px] shadow-sm overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white">
                <div className="w-1/2">
                    <Input
                        size="large"
                        placeholder="Tìm kiếm bạn bè, nhóm..."
                        prefix={<SearchIcon size={18} className="text-gray-400" />}
                        className="bg-[#F8F9FE] border-none rounded-full px-4 text-sm"
                    />
                </div>
                <div className="flex items-center gap-5 text-gray-400">
                    <Bell size={20} className="hover:text-gray-600 cursor-pointer" />
                    <MoreVertical size={20} className="hover:text-gray-600 cursor-pointer" />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {/* Banner */}
                <div className="bg-gradient-to-br from-[#5B5CE2] to-[#7A7BF2] rounded-3xl p-10 mb-10 text-white shadow-lg shadow-[#5B5CE2]/20">
                    <Title level={2} className="!text-white mb-3">Mở rộng vòng kết nối của bạn</Title>
                    <Paragraph className="text-blue-100 mb-8 max-w-xl text-base">
                        Khám phá những người có cùng sở thích, kỹ năng hoặc đang làm việc trong cùng lĩnh vực với bạn.
                    </Paragraph>
                    <Space size="middle">
                        <Tag className="px-4 py-1.5 bg-white/20 border-white/10 rounded-full text-xs font-medium backdrop-blur-sm text-white">#Designers</Tag>
                        <Tag className="px-4 py-1.5 bg-white/20 border-white/10 rounded-full text-xs font-medium backdrop-blur-sm text-white">#Developers</Tag>
                        <Tag className="px-4 py-1.5 bg-white/20 border-white/10 rounded-full text-xs font-medium backdrop-blur-sm text-white">#ProductManager</Tag>
                    </Space>
                </div>

                {/* Gợi ý kết bạn */}
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-6">
                        <Title level={5} className="!mb-0">Gợi ý kết bạn</Title>
                        <Button type="link" className="text-[#5B5CE2] text-xs font-medium p-0">Xem tất cả</Button>
                    </div>

                    <Row gutter={24}>
                        {[
                            { name: 'Minh Quang', role: 'UI/UX Designer', loc: 'TP.HCM', tags: [{ name: 'FIGMA', color: 'blue' }, { name: 'PROTOTYPING', color: 'blue' }], img: 11, active: true },
                            { name: 'Thanh Hằng', role: 'Content Creator', loc: 'Hà Nội', tags: [{ name: 'WRITING', color: 'magenta' }, { name: 'MARKETING', color: 'magenta' }], img: 5, active: false },
                            { name: 'Đức Anh', role: 'Software Engineer', loc: 'Đà Nẵng', tags: [{ name: 'REACT', color: 'green' }, { name: 'PYTHON', color: 'green' }], img: 12, active: true }
                        ].map((user, idx) => (
                            <Col span={8} key={idx}>
                                <Card
                                    className="rounded-2xl shadow-sm hover:shadow-md transition-all h-full"
                                    styles={{ body: { padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' } }}
                                >
                                    <div className="relative mb-4">
                                        <Badge dot status={user.active ? 'success' : 'default'} offset={[-5, 70]} className="!mb-0">
                                            <Avatar src={`https://i.pravatar.cc/150?img=${user.img}`} size={80} className="shadow-sm ring-4 ring-[#F8F9FE]" />
                                        </Badge>
                                    </div>
                                    <Title level={5} className="!mb-0 text-center">{user.name}</Title>
                                    <Text type="secondary" className="text-[11px] mt-1 mb-4 text-center block">{user.role} • {user.loc}</Text>
                                    <Space size="small" className="mb-6 flex flex-wrap justify-center">
                                        {user.tags.map(tag => (
                                            <Tag color={tag.color} key={tag.name} className="m-0 text-[9px] font-bold px-2 py-0.5 rounded border-none bg-opacity-20">
                                                {tag.name}
                                            </Tag>
                                        ))}
                                    </Space>
                                    <Button type="primary" block className="rounded-xl mt-auto h-10 text-xs font-bold shadow-none">
                                        Kết bạn
                                    </Button>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* Kết quả tìm kiếm mới nhất */}
                <div>
                    <Title level={5} className="mb-6">Kết quả tìm kiếm mới nhất</Title>
                    <div className="space-y-4">
                        {[
                            { name: 'Ngọc Bích', role: 'Họa sĩ minh họa tự do tại TP.HCM', img: 44 },
                            { name: 'Tùng Dương', role: 'Co-founder tại TechVibe Studios', img: 33 }
                        ].map((user, idx) => (
                            <Card
                                key={idx}
                                className="rounded-2xl shadow-sm hover:border-[#5B5CE2]/30 transition-colors"
                                styles={{ body: { padding: '16px' } }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar src={`https://i.pravatar.cc/150?img=${user.img}`} size={48} shape="square" className="rounded-xl" />
                                        <div>
                                            <Title level={5} className="!mb-0 !text-sm">{user.name}</Title>
                                            <Text type="secondary" className="text-xs mt-0.5 block">{user.role}</Text>
                                        </div>
                                    </div>
                                    <Space size="middle">
                                        <Button type="text" icon={<MessageSquarePlus size={18} />} className="text-gray-400 hover:text-[#5B5CE2] hover:bg-blue-50" />
                                        <Button className="rounded-lg text-xs font-bold text-gray-600">
                                            Trang cá nhân
                                        </Button>
                                    </Space>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Search