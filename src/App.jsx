import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ConfigProvider, theme as antdTheme } from 'antd'
import { AuthProvider } from './Context/AuthContext'
import { ThemeProvider, useTheme } from './Context/ThemeContext'
import ChatApp from './components/Pages/ChatApp'
import Chats from './components/Pages/Chats/Chats'
import Search from './components/Pages/Search/Search'
import Profile from './components/Pages/Profiles/Profile'
import OtherProfile from './components/Pages/Profiles/OtherProfile'
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
  const location = useLocation()
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
  const isDark = effectiveTheme === 'dark' && !isAuthPage
  const appliedAlgorithm = isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm

  return (
    <ConfigProvider
      theme={{
        algorithm: appliedAlgorithm,
        token: {
          colorPrimary: '#5B5CE2',
          borderRadius: 12,
          fontFamily: 'inherit',
          colorBgLayout: isDark ? '#1a1b26' : '#F8F9FE',
          colorBgContainer: isDark ? '#24283b' : '#ffffff',
          colorBorderSecondary: isDark ? '#2f334d' : '#f3f4f6',
        },
        components: {
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: isDark ? 'rgba(91, 92, 226, 0.15)' : '#EEF0FF',
            itemSelectedColor: '#5B5CE2',
            itemHoverBg: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f9fafb',
          },
          Card: {
            colorBorderSecondary: 'transparent',
          }
        }
      }}
    >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/" element={<PrivateRoute><ChatApp /></PrivateRoute>}>
            <Route index element={<Navigate to="/chats" replace />} />
            <Route path="chats" element={<Chats />} />
            <Route path="search" element={<Search />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:uid" element={<OtherProfile />} />
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
    </ConfigProvider>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App