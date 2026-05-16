import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const ChatApp = () => {
    return (
        // height: 100dvh cho Safari mobile
        // Mobile: flex-col — Sidebar nằm dưới (order-2), Content trên (order-1)
        // md+ : flex-row — Sidebar bên trái, Content bên phải
        <div className="flex flex-col md:flex-row h-[100dvh] w-screen overflow-hidden bg-white dark:bg-[#1a1b26] transition-colors duration-300">
            {/* Content phải đặt TRƯỚC Sidebar trong DOM để dùng order trên mobile */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden order-1 md:order-2">
                <Outlet />
            </div>
            {/* Sidebar: order-2 → nằm dưới cùng trên mobile */}
            <div className="order-2 md:order-1 shrink-0">
                <Sidebar />
            </div>
        </div>
    )
}

export default ChatApp