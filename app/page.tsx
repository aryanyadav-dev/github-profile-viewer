"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Github,
  GitFork,
  Star,
  Calendar,
  MapPin,
  LinkIcon,
  Building,
  Users,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import InfiniteScroll from 'react-infinite-scroll-component'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import RepositoryCard from '@/components/RepositoryCard'
import { languageColors } from '@/lib/utils'

interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  bio: string
  location: string
  blog: string
  company: string
  public_repos: number
  followers: number
  following: number
  created_at: string
  html_url: string
  organizations_url: string
}

interface Organization {
  login: string
  avatar_url: string
  description: string
}

interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string
  topics: string[]
  updated_at: string
  owner: {
    login: string
  }
  dependencies_url?: string
  health_percentage?: number
  watchers_count: number
  open_issues_count: number
  size: number
}

export default function GitHubProfileViewer() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Local state
  const [currentUser, setCurrentUser] = useState<GitHubUser | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [starredRepositories, setStarredRepositories] = useState<Repository[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [languageFilter, setLanguageFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'updated'>('updated')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle URL parameters and browser navigation
  useEffect(() => {
    const username = searchParams.get('username')
    if (username) {
      setSearchQuery(username)
      searchUser(username)
    } else {
      // Clear state when no username in URL
      setCurrentUser(null)
      setRepositories([])
      setStarredRepositories([])
      setOrganizations([])
      setError(null)
      setPage(1)
      setHasMore(true)
    }
  }, [searchParams])

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const username = new URLSearchParams(window.location.search).get('username')
      if (username) {
        setSearchQuery(username)
        searchUser(username)
      } else {
        // Clear state when navigating back to initial state
        setCurrentUser(null)
        setRepositories([])
        setStarredRepositories([])
        setOrganizations([])
        setError(null)
        setPage(1)
        setHasMore(true)
        setSearchQuery('')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const updateURL = (username: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (username) {
      params.set('username', username)
    } else {
      params.delete('username')
    }
    const newURL = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newURL)
  }

  const searchUser = async (username: string) => {
    if (!username.trim()) {
      updateURL('')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Reset state for new search
      setPage(1)
      setHasMore(true)
      setRepositories([])
      setStarredRepositories([])
      setOrganizations([])

      // Fetch user data
      const userResponse = await fetch(`https://api.github.com/users/${username}`)
      if (!userResponse.ok) throw new Error('User not found')
      const userData = await userResponse.json()

      // Fetch organizations
      const orgsResponse = await fetch(userData.organizations_url)
      const orgsData = await orgsResponse.json()

      // Fetch repositories with pagination
      const reposResponse = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=30&page=1`
      )
      const reposData = await reposResponse.json()
      
      // Check if there are more pages
      const linkHeader = reposResponse.headers.get('Link')
      const hasNextPage = linkHeader?.includes('rel="next"') ?? false

      setCurrentUser(userData)
      setRepositories(reposData)
      setOrganizations(orgsData)
      setHasMore(hasNextPage)
      updateURL(username)

      // Fetch starred repositories
      const starredReposResponse = await fetch(
        `https://api.github.com/users/${username}/starred?sort=updated&per_page=12`
      )
      const starredReposData = await starredReposResponse.json()
      setStarredRepositories(starredReposData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setCurrentUser(null)
      setRepositories([])
      setStarredRepositories([])
      setOrganizations([])
      updateURL('')
    } finally {
      setLoading(false)
    }
  }

  const loadMoreRepositories = () => {
    if (hasMore && !loading && currentUser) {
      setPage(prevPage => {
        const nextPage = prevPage + 1
        fetch(
          `https://api.github.com/users/${currentUser.login}/repos?sort=updated&per_page=30&page=${nextPage}`
        )
          .then(response => {
            const hasNextPage = response.headers.get('Link')?.includes('rel="next"') ?? false
            setHasMore(hasNextPage)
            return response.json()
          })
          .then(newRepos => {
            setRepositories(prev => [...prev, ...newRepos])
          })
          .catch(err => {
            setError(err instanceof Error ? err.message : 'Failed to load more repositories')
          })
        return nextPage
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchUser(searchQuery)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Add filtering and sorting functions
  const getUniqueLanguages = (repos: Repository[]) => {
    const languages = repos.map(repo => repo.language).filter(Boolean)
    return Array.from(new Set(languages))
  }

  const filterAndSortRepositories = (repos: Repository[]) => {
    return repos
      .filter(repo => languageFilter === "all" || repo.language === languageFilter)
      .sort((a, b) => {
        let compareValue = 0
        switch (sortBy) {
          case "stars":
            compareValue = b.stargazers_count - a.stargazers_count
            break
          case "forks":
            compareValue = b.forks_count - a.forks_count
            break
          case "updated":
            compareValue = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            break
        }
        return sortOrder === "desc" ? compareValue : -compareValue
      })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Github className="w-8 h-8 text-slate-700 dark:text-slate-300" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              GitViewer
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Discover profiles, repositories, and developer insights
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Enter GitHub username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-20 h-12 text-lg border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-lg"
            />
            <Button
              onClick={() => searchUser(searchQuery)}
              disabled={loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg"
            >
              {loading ? '...' : 'Search'}
            </Button>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-md mx-auto mb-8"
            >
              <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <CardContent className="p-4 text-center text-red-600 dark:text-red-400">
                  {error}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence>
          {currentUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* User Profile Card */}
              <Card className="overflow-hidden border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                      <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-700 shadow-lg">
                        <AvatarImage src={currentUser.avatar_url || "/placeholder.svg"} alt={currentUser.name} />
                        <AvatarFallback>{currentUser.login[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </motion.div>

                    <div className="flex-1 text-center md:text-left">
                      <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2"
                      >
                        {currentUser.name || currentUser.login}
                      </motion.h2>

                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-600 dark:text-slate-400 text-lg mb-4"
                      >
                        @{currentUser.login}
                      </motion.p>

                      {currentUser.bio && (
                        <motion.p
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="text-slate-700 dark:text-slate-300 mb-4 text-lg"
                        >
                          {currentUser.bio}
                        </motion.p>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6"
                      >
                        {currentUser.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {currentUser.location}
                          </div>
                        )}
                        {currentUser.company && (
                          <div className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {currentUser.company}
                          </div>
                        )}
                        {currentUser.blog && (
                          <div className="flex items-center gap-1">
                            <LinkIcon className="w-4 h-4" />
                            <a
                              href={currentUser.blog}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-500"
                            >
                              {currentUser.blog}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Joined {formatDate(currentUser.created_at)}
                        </div>
                      </motion.div>

                      {/* Stats */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex gap-6 justify-center md:justify-start"
                      >
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                            {currentUser.public_repos}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Repositories</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{currentUser.followers}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Followers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{currentUser.following}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Following</div>
                        </div>
                      </motion.div>

                      {/* Organizations */}
                      {organizations.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                          className="flex flex-wrap gap-2 mt-4"
                        >
                          {organizations.map((org) => (
                            <Avatar
                              key={org.login}
                              className="w-8 h-8 border-2 border-white dark:border-slate-700"
                              title={org.login}
                            >
                              <AvatarImage src={org.avatar_url} alt={org.login} />
                              <AvatarFallback>{org.login[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Repository Controls and List */}
              {repositories.length > 0 && (
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
                  >
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      Public Repositories
                    </h3>
                    
                    <div className="flex flex-wrap gap-4">
                      {/* Language Filter */}
                      <select
                        value={languageFilter}
                        onChange={(e) => setLanguageFilter(e.target.value)}
                        className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                      >
                        <option value="all">All Languages</option>
                        {getUniqueLanguages(repositories).map((lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ))}
                      </select>

                      {/* Sort By */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'stars' | 'forks' | 'updated')}
                        className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                      >
                        <option value="updated">Last Updated</option>
                        <option value="stars">Stars</option>
                        <option value="forks">Forks</option>
                      </select>

                      {/* Sort Order */}
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                      >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                      </select>
                    </div>
                  </motion.div>

                  <InfiniteScroll
                    dataLength={repositories.length}
                    next={loadMoreRepositories}
                    hasMore={hasMore}
                    loader={
                      <div className="flex justify-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    }
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  >
                    {filterAndSortRepositories(repositories).map((repo: Repository) => (
                      <RepositoryCard
                        key={repo.id}
                        repository={repo}
                        languageColors={languageColors}
                      />
                    ))}
                  </InfiniteScroll>

                  {/* Remove RecommendedRepositories section */}
                </div>
              )}

              {/* Starred Repositories */}
              {starredRepositories.length > 0 && (
                <div className="mt-12">
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6"
                  >
                    Starred Repositories
                  </motion.h3>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {starredRepositories.map((repo: Repository, index: number) => (
                      <motion.div
                        key={repo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                      >
                        <RepositoryCard
                          repository={repo}
                          languageColors={languageColors}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
