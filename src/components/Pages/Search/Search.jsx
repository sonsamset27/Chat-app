import React, { useState } from 'react'
import { Input, Typography, Row, Col, Spin, Empty } from 'antd'
import { Search as SearchIcon, Bell, MoreVertical } from 'lucide-react'
import useFriendSuggestions from '../../../hooks/useFriendSuggestions'
import useSearchUsers from '../../../hooks/useSearchUsers'
import useIncomingRequests from '../../../hooks/useIncomingRequests'
import SearchFriendSuggestionCard from './components/SearchFriendSuggestionCard'
import SearchRecentCard from './components/SearchRecentCard'
import { useAuth } from '../../../Context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Badge as AntBadge } from 'antd'

const { Title, Text } = Typography

const Search = () => {
    const { currentUser } = useAuth()
    const navigate = useNavigate()
    const { suggestions, loading: suggestLoading, refreshSuggestions } = useFriendSuggestions()
    const { searchResults, recentSearches, loading: searchLoading, searchUsers, saveRecentSearch } = useSearchUsers()
    const { requests } = useIncomingRequests()
    
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (e) => {
        const val = e.target.value
        setSearchQuery(val)
        searchUsers(val)
    }

    const handleUserClick = async (user) => {
        if (searchQuery.trim()) {
            await saveRecentSearch(user.userId)
        }
        navigate(`/profile/${user.userId}`)
    }

    const displayResults = searchQuery.trim() ? searchResults : recentSearches
    const resultsTitle = searchQuery.trim() ? 'Kết quả tìm kiếm' : 'Tìm kiếm gần đây'

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#1a1b26] rounded-tl-[30px] shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1b26] transition-colors duration-300">
                <div className="w-1/2">
                    <Input
                        size="large"
                        placeholder="Tìm kiếm bạn bè..."
                        prefix={<SearchIcon size={18} className="text-gray-400" />}
                        className="bg-[#F8F9FE] dark:bg-[#24283b] border-none rounded-full px-4 text-sm transition-colors duration-300"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex items-center gap-5 text-gray-400">
                    <AntBadge count={requests.length} size="small" offset={[-5, 5]}>
                        <Bell size={20} className="hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" onClick={() => navigate('/profile')} />
                    </AntBadge>
                    <MoreVertical size={20} className="hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {/* Banner */}
                {!searchQuery.trim() && (
                    <div className="bg-linear-to-br from-[#5B5CE2] to-[#7A7BF2] rounded-3xl p-10 mb-10 text-white shadow-lg shadow-[#5B5CE2]/20 flex flex-col gap-5">
                        <Title level={2} className="!mb-0 text-white mb-3">Mở rộng vòng kết nối của bạn</Title>
                        <Text className="!text-blue-100 mb-8 max-w-xl text-base">
                            Khám phá những người có cùng sở thích, kỹ năng hoặc đang làm việc trong cùng lĩnh vực với bạn.
                        </Text>
                    </div>
                )}

                {/* Gợi ý kết bạn */}
                {!searchQuery.trim() && (
                    <div className="mb-10">
                        <div className="flex justify-between items-center mb-6">
                            <Title level={5} className="mb-0!">Gợi ý kết bạn</Title>
                            <a onClick={refreshSuggestions} className="text-[#5B5CE2] text-xs font-medium cursor-pointer hover:underline">
                                Đổi lại
                            </a>
                        </div>
                        {suggestLoading ? (
                            <div className="flex justify-center py-10"><Spin /></div>
                        ) : suggestions.length > 0 ? (
                            <Row gutter={24}>
                                {suggestions.map((user) => (
                                    <Col span={8} key={user.userId}>
                                        <SearchFriendSuggestionCard user={user} />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Empty description="Không có gợi ý nào vào lúc này" />
                        )}
                    </div>
                )}

                {/* Kết quả tìm kiếm / Tìm kiếm gần đây */}
                <div>
                    <Title level={5} className="mb-6!">{resultsTitle}</Title>
                    {searchLoading ? (
                        <div className="flex justify-center py-10"><Spin /></div>
                    ) : displayResults.length > 0 ? (
                        <div className="space-y-4">
                            {displayResults.map((user) => (
                                <div key={user.userId} onClick={() => handleUserClick(user)}>
                                    <SearchRecentCard user={user} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty description={searchQuery.trim() ? "Không tìm thấy kết quả" : "Chưa có tìm kiếm gần đây"} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default Search