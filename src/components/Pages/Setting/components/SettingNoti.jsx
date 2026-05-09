import React from 'react'
import { Card, Form, Switch, Button, Typography, Divider } from 'antd'

const { Title, Text } = Typography

const SettingNoti = () => {
    return (
        <Card className="rounded-2xl shadow-sm border-none dark:bg-[#24283b] transition-colors duration-300" styles={{ body: { padding: '24px' } }}>
            <Title level={5} className="mb-6! dark:text-white">Tùy chọn thông báo</Title>
            <Form layout="horizontal" labelCol={{ span: 20 }} wrapperCol={{ span: 4 }}>
                <div className="space-y-4">
                    <Form.Item label={<Text strong className="dark:text-gray-300">Thông báo đẩy</Text>} className="mb-0 flex justify-between">
                        <Switch defaultChecked />
                    </Form.Item>
                    <Form.Item label={<Text strong className="dark:text-gray-300">Email tóm tắt hàng tuần</Text>} className="mb-0 flex justify-between">
                        <Switch defaultChecked />
                    </Form.Item>
                    <Form.Item label={<Text strong className="dark:text-gray-300">Âm thanh tin nhắn mới</Text>} className="mb-0 flex justify-between">
                        <Switch />
                    </Form.Item>
                </div>
                <Divider className="dark:border-gray-700" />
                <div className="flex justify-end">
                    <Button type="primary" size="large" className="rounded-xl px-8 font-bold shadow-md shadow-[#5B5CE2]/20">
                        Lưu thông báo
                    </Button>
                </div>
            </Form>
        </Card>
    )
}

export default SettingNoti
