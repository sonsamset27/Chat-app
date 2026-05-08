import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { AuthProvider } from './Context/AuthContext'
import ChatApp from './components/Pages/ChatApp'
import Chats from './components/Pages/Chats/Chats'
import Search from './components/Pages/Search/Search'
import Profile from './components/Pages/Profiles/Profile'
import Settings from './components/Pages/Setting/Settings'
import Login from './components/Auth/Login'
import SignUp from './components/Auth/SignUp'
import PrivateRoute from './components/Auth/PrivateRoute'

const App = () => {
  return (
    <AuthProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#5B5CE2',
            borderRadius: 12,
            fontFamily: 'inherit',
            colorTextBase: '#333333',
          },
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            <Route path="/" element={<PrivateRoute><ChatApp /></PrivateRoute>}>
              <Route index element={<Navigate to="/chats" replace />} />
              <Route path="chats" element={<Chats />} />
              <Route path="search" element={<Search />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </AuthProvider>
  )
}

export default App