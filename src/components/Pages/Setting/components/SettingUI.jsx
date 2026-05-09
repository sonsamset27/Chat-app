import React, { useState, useEffect } from 'react'
import { Card, Form, Select, Button, Typography, Divider, message } from 'antd'
import { useTheme } from '../../../../Context/ThemeContext'

const { Title, Text } = Typography

const FONT_SIZE_MAP = { small: '13px', medium: '15px', large: '17px' }

const applyFontSize = (size) => {
    document.documentElement.style.setProperty('--app-font-size', FONT_SIZE_MAP[size] ?? '15px')
    document.documentElement.style.fontSize = FONT_SIZE_MAP[size] ?? '15px'
}

const SettingUI = () => {
    const [fontSize, setFontSize] = useState(
        () => localStorage.getItem('chat-app-fontSize') || 'medium'
    )
    const { theme, setTheme } = useTheme()

    const [localTheme, setLocalTheme] = useState(theme)
    const [savingAppearance, setSavingAppearance] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()

    useEffect(() => {
        const saved = localStorage.getItem('chat-app-fontSize') || 'medium'
        applyFontSize(saved)
    }, [])

    useEffect(() => {
        setLocalTheme(theme)
    }, [theme])

    const handleSaveAppearance = () => {
        setSavingAppearance(true)
        try {
            localStorage.setItem('chat-app-fontSize', fontSize)
            applyFontSize(fontSize)
            setTheme(localTheme)
            messageApi.success('Đã lưu cài đặt giao diện!')
        } catch (err) {
            messageApi.error('Lưu thất bại.')
        } finally {
            setSavingAppearance(false)
        }
    }

    return (
        <Card className="rounded-2xl shadow-sm border-none transition-colors duration-300" styles={{ body: { padding: '24px' } }}>
            {contextHolder}
            <Title level={5} className="mb-6!">Cài đặt giao diện</Title>

            <Form layout="vertical">
                <Form.Item label="Chủ đề">
                    <Select
                        size="large"
                        value={localTheme}
                        onChange={setLocalTheme}
                        className="w-full"
                    >
                        <Select.Option value="light">☀️&nbsp; Sáng</Select.Option>
                        <Select.Option value="dark">🌙&nbsp; Tối</Select.Option>
                        <Select.Option value="system">💻&nbsp; Theo hệ thống</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Kích thước chữ">
                    <Select
                        size="large"
                        value={fontSize}
                        onChange={setFontSize}
                        className="w-full"
                    >
                        <Select.Option value="small">Nhỏ (13px)</Select.Option>
                        <Select.Option value="medium">Vừa (15px) — Mặc định</Select.Option>
                        <Select.Option value="large">Lớn (17px)</Select.Option>
                    </Select>
                </Form.Item>

                <div className="rounded-xl bg-[#F8F9FE] dark:bg-[#1a1b26] border border-gray-100 dark:border-gray-800 p-4 mb-4 transition-colors duration-300">
                    <Text type="secondary" className="text-xs block mb-2 uppercase tracking-wider font-semibold">
                        Xem trước
                    </Text>
                    <p style={{ fontSize: FONT_SIZE_MAP[fontSize] }} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-0 transition-colors duration-300">
                        Đây là đoạn văn bản mẫu. Chọn kích thước phù hợp với màn hình của bạn.
                    </p>
                </div>

                <Divider className="dark:border-gray-700" />
                <div className="flex justify-end">
                    <Button
                        type="primary"
                        size="large"
                        loading={savingAppearance}
                        className="rounded-xl px-8 font-bold shadow-md shadow-[#5B5CE2]/20"
                        onClick={handleSaveAppearance}
                    >
                        Lưu giao diện
                    </Button>
                </div>
            </Form>
        </Card>
    )
}

export default SettingUI
