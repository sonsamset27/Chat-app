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
        <div className="h-full flex flex-col bg-white dark:bg-[#1a1b26] shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300">

            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1b26] transition-colors duration-300 gap-4">
                <div className="flex-1 max-w-xl">
                    <Input
                        size="large"
                        placeholder="Tìm kiếm bạn bè..."
                        prefix={<SearchIcon size={18} className="text-gray-400" />}
                        className="bg-[#F8F9FE] dark:bg-[#24283b] border-none rounded-full px-4 text-sm transition-colors duration-300"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex items-center gap-4 text-gray-400 shrink-0">
                    <AntBadge count={requests.length} size="small" offset={[-5, 5]}>
                        <Bell
                            size={20}
                            className="hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                            onClick={() => navigate('/profile')}
                        />
                    </AntBadge>
                    <MoreVertical size={20} className="hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">

                {/* Banner */}
                {!searchQuery.trim() && (
                    <div className="bg-gradient-to-br from-[#5B5CE2] to-[#7A7BF2] rounded-2xl md:rounded-3xl p-6 md:p-10 mb-6 md:mb-10 text-white shadow-lg shadow-[#5B5CE2]/20 flex flex-col gap-3 md:gap-5">
                        <Title level={3} className="!mb-0 !text-white !text-xl md:!text-2xl lg:!text-3xl">
                            Mở rộng vòng kết nối của bạn
                        </Title>
                        <Text className="!text-blue-100 text-sm md:text-base max-w-lg">
                            Khám phá những người có cùng sở thích, kỹ năng hoặc đang làm việc trong cùng lĩnh vực với bạn.
                        </Text>
                    </div>
                )}

                {/* Friend Suggestions */}
                {!searchQuery.trim() && (
                    <div className="mb-6 md:mb-10">
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                            <Title level={5} className="!mb-0">Gợi ý kết bạn</Title>
                            <a
                                onClick={refreshSuggestions}
                                className="text-[#5B5CE2] text-xs font-medium cursor-pointer hover:underline"
                            >
                                Đổi lại
                            </a>
                        </div>
                        {suggestLoading ? (
                            <div className="flex justify-center py-10"><Spin /></div>
                        ) : suggestions.length > 0 ? (
                            <Row gutter={[16, 16]}>
                                {suggestions.map((user) => (
                                    // xs=24 (1 col mobile), sm=12 (2 col tablet), lg=8 (3 col desktop)
                                    <Col xs={24} sm={12} lg={8} key={user.userId}>
                                        <SearchFriendSuggestionCard user={user} />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Empty description="Không có gợi ý nào vào lúc này" />
                        )}
                    </div>
                )}

                {/* Search Results / Recent Searches */}
                <div>
                    <Title level={5} className="!mb-4 md:!mb-6">{resultsTitle}</Title>
                    {searchLoading ? (
                        <div className="flex justify-center py-10"><Spin /></div>
                    ) : displayResults.length > 0 ? (
                        <div className="space-y-3 md:space-y-4">
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