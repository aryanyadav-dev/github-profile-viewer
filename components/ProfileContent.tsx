import React from 'react'
import { motion } from 'framer-motion'
import {
  GitFork,
  Star,
  Calendar,
  MapPin,
  LinkIcon,
  Building,
  Users,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProfileAnalysis } from '@/app/components/ProfileAnalysis'
import InfiniteScroll from 'react-infinite-scroll-component'
import RepositoryCard from './RepositoryCard'

interface ProfileContentProps {
  user: any
  repositories: any[]
  organizations: any[]
  languageFilter: string
  sortBy: string
  getUniqueLanguages: (repos: any[]) => string[]
  setLanguageFilter: (filter: string) => void
  setSortBy: (sort: 'stars' | 'forks' | 'updated') => void
  setSortOrder: (order: 'asc' | 'desc') => void
  sortOrder: 'asc' | 'desc'
  hasMore: boolean
  loadMoreRepositories: () => void
  languageColors: any
  formatDate: (date: string) => string
  filterAndSortRepositories: (repos: any[]) => any[]
}

export function ProfileContent({
  user,
  repositories,
  organizations,
  languageFilter,
  sortBy,
  getUniqueLanguages,
  setLanguageFilter,
  setSortBy,
  setSortOrder,
  sortOrder,
  hasMore,
  loadMoreRepositories,
  languageColors,
  formatDate,
  filterAndSortRepositories,
}: ProfileContentProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column - Profile Info */}
      <div className="lg:col-span-3">
        <div className="space-y-6 sticky top-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-32 h-32 mb-6 border-4 border-white dark:border-slate-700 shadow-lg">
                    <AvatarImage src={user.avatar_url} alt={user.login} />
                    <AvatarFallback>{user.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1">{user.name || user.login}</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">@{user.login}</p>
                  {user.bio && <p className="text-sm text-slate-700 dark:text-slate-300 mb-6">{user.bio}</p>}
                  
                  <div className="w-full space-y-4 text-sm">
                    {user.company && (
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <Building className="w-4 h-4" />
                        <span>{user.company}</span>
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.blog && (
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <LinkIcon className="w-4 h-4" />
                        <a href={user.blog} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors truncate">
                          {user.blog}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDate(user.created_at)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 w-full mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-slate-800 dark:text-slate-200">{user.followers}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-slate-800 dark:text-slate-200">{user.following}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-slate-800 dark:text-slate-200">{user.public_repos}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Repos</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Organizations */}
          {organizations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Organizations</h3>
                  <div className="flex flex-wrap gap-4">
                    {organizations.map((org) => (
                      <a
                        key={org.login}
                        href={`https://github.com/${org.login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 group"
                      >
                        <Avatar className="w-8 h-8 border-2 border-white dark:border-slate-700">
                          <AvatarImage src={org.avatar_url} alt={org.login} />
                          <AvatarFallback>{org.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-blue-500 transition-colors">
                          {org.login}
                        </span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Right Column - Analysis and Repositories */}
      <div className="lg:col-span-9 space-y-6">
        {/* AI Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ProfileAnalysis userData={user} repositories={repositories} />
        </motion.div>

        {/* Repository Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={languageFilter === 'all' ? 'default' : 'secondary'}
                    className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-4 py-1.5"
                    onClick={() => setLanguageFilter('all')}
                  >
                    All
                  </Badge>
                  {getUniqueLanguages(repositories).map((lang) => (
                    <Badge
                      key={lang}
                      variant={languageFilter === lang ? 'default' : 'secondary'}
                      className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-4 py-1.5"
                      onClick={() => setLanguageFilter(lang)}
                    >
                      {lang}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-4 items-center">
                  <select
                    className="bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-1.5 text-sm text-slate-700 dark:text-slate-300"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'stars' | 'forks' | 'updated')}
                  >
                    <option value="updated">Recently Updated</option>
                    <option value="stars">Stars</option>
                    <option value="forks">Forks</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Repositories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <InfiniteScroll
            dataLength={repositories.length}
            next={loadMoreRepositories}
            hasMore={hasMore}
            loader={
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading more repositories...</span>
                </div>
              </div>
            }
            className="space-y-4"
          >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filterAndSortRepositories(repositories).map((repo) => (
                <RepositoryCard key={repo.id} repository={repo} languageColors={languageColors} />
              ))}
            </div>
          </InfiniteScroll>
        </motion.div>
      </div>
    </div>
  )
} 