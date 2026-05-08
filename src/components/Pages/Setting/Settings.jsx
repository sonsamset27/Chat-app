import React, { useState } from 'react'
import { Card, Form, Input, Switch, Select, Button, Typography, Divider, Menu, Space, Avatar } from 'antd'
import { User, Bell, Shield, Palette, HelpCircle, LogOut } from 'lucide-react'

const { Title, Text } = Typography

const Settings = () => {
    const [activeTab, setActiveTab] = useState('account')
    const [form] = Form.useForm()

    const menuItems = [
        { key: 'account', icon: <User size={18} />, label: 'Tài khoản' },
        { key: 'notifications', icon: <Bell size={18} />, label: 'Thông báo' },
        { key: 'security', icon: <Shield size={18} />, label: 'Bảo mật' },
        { key: 'appearance', icon: <Palette size={18} />, label: 'Giao diện' },
        { key: 'help', icon: <HelpCircle size={18} />, label: 'Trợ giúp' },
    ]

    return (
        <div className="h-full flex flex-col bg-[#F8F9FE] rounded-tl-[30px] shadow-sm overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 bg-white">
                <Title level={3} className="!mb-1">Cài đặt</Title>
                <Text type="secondary">Quản lý tùy chọn và cài đặt tài khoản của bạn</Text>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-white border-r border-gray-100 flex flex-col p-4">
                    <Menu
                        mode="inline"
                        selectedKeys={[activeTab]}
                        onClick={({ key }) => setActiveTab(key)}
                        items={menuItems}
                        className="border-none bg-transparent custom-settings-menu"
                    />
                    
                    <div className="mt-auto">
                        <Button type="text" danger icon={<LogOut size={18} />} className="w-full flex items-center justify-start h-10 px-4 font-medium rounded-xl hover:bg-red-50">
                            Đăng xuất
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-2xl">
                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                <Card className="rounded-2xl shadow-sm border-none" styles={{ body: { padding: '24px' } }}>
                                    <Title level={5} className="!mb-6">Hồ sơ công khai</Title>
                                    
                                    <div className="flex items-center gap-6 mb-8">
                                        <Avatar src="https://i.pravatar.cc/150?img=11" size={80} />
                                        <Space size="middle">
                                            <Button type="primary" className="rounded-xl shadow-none font-medium">Thay đổi ảnh</Button>
                                            <Button className="rounded-xl font-medium text-gray-600">Xóa</Button>
                                        </Space>
                                    </div>

                                    <Form form={form} layout="vertical" initialValues={{ name: 'Minh Nguyen', username: '@minhnguyen' }}>
                                        <Form.Item label="Họ và tên" name="name">
                                            <Input size="large" className="rounded-xl bg-[#F8F9FE] border-gray-100" />
                                        </Form.Item>
                                        <Form.Item label="Tên người dùng" name="username">
                                            <Input size="large" className="rounded-xl bg-[#F8F9FE] border-gray-100" />
                                        </Form.Item>
                                        <Form.Item label="Tiểu sử">
                                            <Input.TextArea rows={4} className="rounded-xl bg-[#F8F9FE] border-gray-100 resize-none" placeholder="Viết một chút về bản thân bạn..." />
                                        </Form.Item>
                                        <Divider />
                                        <div className="flex justify-end">
                                            <Button type="primary" size="large" className="rounded-xl px-8 font-bold shadow-md shadow-[#5B5CE2]/20">Lưu thay đổi</Button>
                                        </div>
                                    </Form>
                                </Card>

                                <Card className="rounded-2xl shadow-sm border-none" styles={{ body: { padding: '24px' } }}>
                                    <Title level={5} className="!mb-6 text-red-500">Xóa tài khoản</Title>
                                    <Text className="block mb-4">Một khi bạn xóa tài khoản của mình, không thể khôi phục lại dữ liệu. Hãy chắc chắn.</Text>
                                    <Button danger className="rounded-xl font-medium">Xóa tài khoản của tôi</Button>
                                </Card>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <Card className="rounded-2xl shadow-sm border-none" styles={{ body: { padding: '24px' } }}>
                                <Title level={5} className="!mb-6">Tùy chọn thông báo</Title>
                                
                                <Form layout="horizontal" labelCol={{ span: 20 }} wrapperCol={{ span: 4 }}>
                                    <div className="space-y-4">
                                        <Form.Item label={<Text strong>Thông báo đẩy</Text>} className="mb-0 flex justify-between">
                                            <Switch defaultChecked />
                                        </Form.Item>
                                        <Form.Item label={<Text strong>Email tóm tắt hàng tuần</Text>} className="mb-0 flex justify-between">
                                            <Switch defaultChecked />
                                        </Form.Item>
                                        <Form.Item label={<Text strong>Âm thanh tin nhắn mới</Text>} className="mb-0 flex justify-between">
                                            <Switch />
                                        </Form.Item>
                                    </div>
                                    <Divider />
                                    <div className="flex justify-end">
                                        <Button type="primary" size="large" className="rounded-xl px-8 font-bold shadow-md shadow-[#5B5CE2]/20">Lưu thông báo</Button>
                                    </div>
                                </Form>
                            </Card>
                        )}

                        {activeTab === 'appearance' && (
                            <Card className="rounded-2xl shadow-sm border-none" styles={{ body: { padding: '24px' } }}>
                                <Title level={5} className="!mb-6">Cài đặt giao diện</Title>
                                
                                <Form layout="vertical">
                                    <Form.Item label="Chủ đề">
                                        <Select size="large" defaultValue="light" className="w-full">
                                            <Select.Option value="light">Sáng (Mặc định)</Select.Option>
                                            <Select.Option value="dark">Tối</Select.Option>
                                            <Select.Option value="system">Theo hệ thống</Select.Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Kích thước chữ">
                                        <Select size="large" defaultValue="medium" className="w-full">
                                            <Select.Option value="small">Nhỏ</Select.Option>
                                            <Select.Option value="medium">Vừa</Select.Option>
                                            <Select.Option value="large">Lớn</Select.Option>
                                        </Select>
                                    </Form.Item>
                                    <Divider />
                                    <div className="flex justify-end">
                                        <Button type="primary" size="large" className="rounded-xl px-8 font-bold shadow-md shadow-[#5B5CE2]/20">Lưu giao diện</Button>
                                    </div>
                                </Form>
                            </Card>
                        )}

                        {(activeTab === 'security' || activeTab === 'help') && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                    {activeTab === 'security' ? <Shield size={24} className="text-[#5B5CE2]" /> : <HelpCircle size={24} className="text-[#5B5CE2]" />}
                                </div>
                                <Title level={4}>Tính năng đang phát triển</Title>
                                <Text type="secondary">Chúng tôi đang hoàn thiện phần này. Vui lòng quay lại sau.</Text>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings
