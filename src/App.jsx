import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme as antdTheme } from 'antd'
import { AuthProvider } from './Context/AuthContext'
import { ThemeProvider, useTheme } from './Context/ThemeContext'
import ChatApp from './components/Pages/ChatApp'
import Chats from './components/Pages/Chats/Chats'
import Search from './components/Pages/Search/Search'
import Profile from './components/Pages/Profiles/Profile'
import Settings from './components/Pages/Setting/Settings'
import SettingAccount from './components/Pages/Setting/components/SettingAccount'
import SettingNoti from './components/Pages/Setting/components/SettingNoti'
import SettingSecurity from './components/Pages/Setting/components/SettingSecurity'
import SettingUI from './components/Pages/Setting/components/SettingUI'
import SettingHelp from './components/Pages/Setting/components/SettingHelp'
import Login from './components/Auth/Login'
import SignUp from './components/Auth/SignUp'
import PrivateRoute from './components/Auth/PrivateRoute'

const AppContent = () => {
  const { effectiveTheme } = useTheme()
  return (
    <ConfigProvider
      theme={{
        algorithm: effectiveTheme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#5B5CE2',
          borderRadius: 12,
          fontFamily: 'inherit',
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
            <Route path="settings" element={<Settings />}>
              <Route index element={<Navigate to="account" replace />} />
              <Route path="account" element={<SettingAccount />} />
              <Route path="notifications" element={<SettingNoti />} />
              <Route path="security" element={<SettingSecurity />} />
              <Route path="appearance" element={<SettingUI />} />
              <Route path="help" element={<SettingHelp />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App