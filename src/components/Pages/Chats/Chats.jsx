import React from 'react'
import { Layout, Avatar, Badge, Input, Button, Typography, Divider } from 'antd'
import { Search, Bell, MoreVertical, Paperclip, Smile, Send, User } from 'lucide-react'

const { Sider, Content } = Layout
const { Text, Title } = Typography

const chatList = [
    { id: 1, name: 'Sarah Wilson', time: '12:45 PM', message: "Sounds good! Let's meet at...", avatar: 'https://i.pravatar.cc/150?img=5', status: 'success', active: true },
    { id: 2, name: 'Marcus Chen', time: 'Yesterday', message: 'Did you see the latest update?', avatar: 'https://i.pravatar.cc/150?img=11', status: 'default', active: false },
    { id: 3, name: 'Design Team', time: 'Oct 24', message: 'Alex: The wireframes are ready...', initials: 'DT', status: 'default', active: false },
]

const Chats = () => {
    return (
        <Layout className="h-full bg-white rounded-tl-[30px] shadow-sm overflow-hidden border border-gray-100 flex-row">
            {/* Chat List */}
            <Sider width={320} className="bg-white border-r border-gray-100 flex flex-col shrink-0" theme="light">
                <div className="p-6 pb-2">
                    <Text className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-4 block">Recent Chats</Text>
                </div>
                <div className="flex-1 overflow-y-auto px-4 space-y-1">
                    {chatList.map((chat) => (
                        <div key={chat.id} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${chat.active ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                            <Badge dot status={chat.status} offset={[-5, 35]}>
                                {chat.avatar ? (
                                    <Avatar src={chat.avatar} size={48} className="border-2 border-white" />
                                ) : (
                                    <Avatar size={48} className="bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white flex items-center justify-center font-bold text-xs">
                                        {chat.initials}
                                    </Avatar>
                                )}
                            </Badge>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-center mb-0.5">
                                    <Text strong className="text-sm truncate">{chat.name}</Text>
                                    <Text type="secondary" className="text-[10px]">{chat.time}</Text>
                                </div>
                                <Text type={chat.active ? undefined : "secondary"} className={`text-xs truncate block ${chat.active ? 'text-gray-500' : ''}`}>
                                    {chat.message}
                                </Text>
                            </div>
                        </div>
                    ))}
                </div>
            </Sider>

            {/* Active Chat Area */}
            <Content className="flex flex-col bg-[#F8F9FE]/30 h-full">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-gray-100 bg-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Avatar src="https://i.pravatar.cc/150?img=5" size={40} />
                        <div>
                            <Title level={5} className="!mb-0 !text-sm">Sarah Wilson</Title>
                            <Text className="text-[10px] text-green-500 font-medium">Online</Text>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400">
                        <Search size={18} className="hover:text-gray-600 cursor-pointer" />
                        <Bell size={18} className="hover:text-gray-600 cursor-pointer" />
                        <MoreVertical size={18} className="hover:text-gray-600 cursor-pointer" />
                        <Divider type="vertical" className="h-6 mx-0" />
                        <Button icon={<User size={14} />} size="small" className="flex items-center gap-2 rounded-lg text-xs font-semibold text-gray-600 border-gray-200">
                            Profile
                        </Button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    <div className="flex justify-center">
                        <span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-400 tracking-wider uppercase shadow-sm">Today</span>
                    </div>

                    {/* Received Message */}
                    <div className="flex justify-start">
                        <div className="bg-[#EEF0FF] text-gray-700 px-5 py-3 rounded-2xl rounded-tl-sm max-w-[70%] text-sm shadow-sm">
                            Hey Felix! Have you had a chance to look at the new brand guidelines I sent over? 🤔
                        </div>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-[-16px] ml-2">12:30 PM</div>

                    {/* Sent Message */}
                    <div className="flex justify-end">
                        <div className="bg-[#5B5CE2] text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[70%] text-sm shadow-sm">
                            Not yet, Sarah. Just getting settled into the desk. Let me open them up right now!
                        </div>
                    </div>
                    <div className="flex justify-end mt-[-16px] mr-2">
                        <Text className="text-[10px] text-gray-400 flex items-center gap-1">12:32 PM <span className="text-[#5B5CE2]">✓✓</span></Text>
                    </div>

                    {/* Received Message */}
                    <div className="flex justify-start flex-col gap-2">
                        <div className="bg-[#EEF0FF] text-gray-700 px-5 py-3 rounded-2xl rounded-tl-sm max-w-[70%] text-sm shadow-sm">
                            Awesome! Pay special attention to the "Human-Centric Clarity" section on page 14.
                        </div>
                        <div className="bg-[#EEF0FF] text-gray-700 px-5 py-3 rounded-2xl max-w-[70%] text-sm shadow-sm">
                            I think it perfectly captures what we're trying to achieve with this update. ✨
                        </div>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-[-4px] ml-2">12:35 PM</div>

                    {/* Sent Message */}
                    <div className="flex justify-end mt-4">
                        <div className="bg-[#5B5CE2] text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[70%] text-sm shadow-sm">
                            Wow, you're right. The emphasis on airy layouts and glassmorphism is spot on. It feels so much more premium yet accessible.
                        </div>
                    </div>
                    <div className="flex justify-end mt-[-16px] mr-2">
                        <Text className="text-[10px] text-gray-400 flex items-center gap-1">12:45 PM <span className="text-[#5B5CE2]">✓✓</span></Text>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-gray-100">
                    <Input
                        size="large"
                        placeholder="Type a message..."
                        prefix={<Button type="text" icon={<Smile size={20} className="text-gray-400" />} />}
                        suffix={
                            <div className="flex items-center gap-2">
                                <Button type="text" icon={<Paperclip size={20} className="text-gray-400" />} />
                                <Button type="primary" icon={<Send size={18} />} className="rounded-xl shadow-md shadow-[#5B5CE2]/30 flex items-center justify-center w-10 h-10" />
                            </div>
                        }
                        className="bg-[#F8F9FE] border-gray-100 rounded-2xl hover:border-[#5B5CE2]/50 focus:border-[#5B5CE2]"
                        style={{ padding: '8px 12px' }}
                    />
                </div>
            </Content>
        </Layout>
    )
}

export default Chats