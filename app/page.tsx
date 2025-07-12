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
import { ProfileAnalysis } from '@/app/components/ProfileAnalysis'
import { languageColors } from '@/lib/utils'
import { ProfileContent } from '@/components/ProfileContent'

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

interface RateLimit {
  limit: number;
  remaining: number;
  reset: number;
}

// Add GitHub API configuration
const GITHUB_API_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

const getHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (GITHUB_API_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_API_TOKEN}`;
  }
  
  return headers;
};

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
  const [rateLimit, setRateLimit] = useState<RateLimit | null>(null);

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

  // Add rate limit check function
  const checkRateLimit = async () => {
    try {
      const response = await fetch('https://api.github.com/rate_limit', {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        const { limit, remaining, reset } = data.rate;
        setRateLimit({ limit, remaining, reset });
        return { limit, remaining, reset };
      }
      return null;
    } catch (err) {
      console.error('Failed to check rate limit:', err);
      return null;
    }
  };

  // Format time until reset
  const getResetTimeString = (resetTimestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const waitSeconds = resetTimestamp - now;
    
    if (waitSeconds <= 0) return 'Rate limit will reset now';
    
    const hours = Math.floor(waitSeconds / 3600);
    const minutes = Math.floor((waitSeconds % 3600) / 60);
    const seconds = waitSeconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    if (seconds > 0) parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);
    
    return `Rate limit will reset in ${parts.join(', ')}`;
  };

  // Modify searchUser to check rate limit first
  const searchUser = async (username: string) => {
    if (!username.trim()) {
      updateURL('')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Check rate limit before making requests
      const rateLimitData = await checkRateLimit();
      if (rateLimitData && rateLimitData.remaining <= 0) {
        throw new Error(`GitHub API rate limit exceeded. ${getResetTimeString(rateLimitData.reset)}`);
      }

      // Reset state for new search
      setPage(1)
      setHasMore(true)
      setRepositories([])
      setStarredRepositories([])
      setOrganizations([])

      // Fetch user data
      const userResponse = await fetch(`https://api.github.com/users/${username}`, {
        headers: getHeaders()
      })
      
      if (!userResponse.ok) {
        if (userResponse.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.')
        }
        if (userResponse.status === 404) {
          throw new Error('User not found')
        }
        throw new Error('Failed to fetch user data')
      }
      
      const userData = await userResponse.json()

      // Fetch organizations
      const orgsResponse = await fetch(userData.organizations_url, {
        headers: getHeaders()
      })
      const orgsData = await orgsResponse.json()

      // Fetch ALL repositories
      let allRepos: Repository[] = [];
      let pageNum = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const reposResponse = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=100&page=${pageNum}`,
          { headers: getHeaders() }
        );

        if (!reposResponse.ok) {
          throw new Error('Failed to fetch repositories');
        }

        const reposData = await reposResponse.json();
        if (!reposData || reposData.length === 0) {
          hasNextPage = false;
        } else {
          allRepos = [...allRepos, ...reposData];
          const linkHeader = reposResponse.headers.get('Link');
          hasNextPage = linkHeader?.includes('rel="next"') ?? false;
          pageNum++;
        }

        // Check rate limit after each page
        const currentRateLimit = await checkRateLimit();
        if (currentRateLimit && currentRateLimit.remaining <= 0) {
          setError(`Note: Only ${allRepos.length} repositories loaded. Rate limit reached.`);
          hasNextPage = false;
        }
      }

      setCurrentUser(userData)
      setRepositories(allRepos)
      setOrganizations(orgsData || [])
      setHasMore(false) // Since we loaded all repos at once
      updateURL(username)

      // Fetch starred repositories
      const starredReposResponse = await fetch(
        `https://api.github.com/users/${username}/starred?sort=updated&per_page=12`,
        { headers: getHeaders() }
      )
      const starredReposData = await starredReposResponse.json()
      setStarredRepositories(starredReposData || [])

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

  // Remove loadMoreRepositories since we're loading all at once
  const loadMoreRepositories = async () => {
    // This is now a no-op since we load all repositories at once
    return;
  };

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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Developer Attribution */}
      <a
        href="https://aryanyadav-portfolio.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-2 left-2 md:fixed md:top-4 md:left-6 z-50 select-none"
      >
        <div className="group relative">
          {/* Main Card */}
          <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 md:px-3.5 py-1 md:py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] transition-all duration-200">
            <div className="flex items-center gap-1.5 md:gap-2.5">
              {/* Pixel Avatar */}
              <div className="relative w-5 h-5 md:w-8 md:h-8 rounded-md overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px]">
                <div className="w-full h-full bg-white dark:bg-slate-800 rounded-[4px] flex items-center justify-center font-bold font-mono text-[10px] md:text-sm text-blue-600 dark:text-blue-400">
                  AY
                </div>
              </div>
              
              {/* Text Content */}
              <div className="flex flex-col">
                <span className="font-mono text-[10px] md:text-sm font-bold bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                  Aryan Yadav
                </span>
                <span className="font-mono text-[8px] md:text-[11px] text-slate-600 dark:text-slate-400">
                  Developer
                </span>
              </div>

              {/* Pixel Decoration */}
              <div className="ml-0.5 md:ml-1 flex space-x-0.5">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500/50 rounded-sm animate-pulse"></div>
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-indigo-500/50 rounded-sm animate-pulse delay-75"></div>
              </div>
            </div>
          </div>
        </div>
      </a>

      {/* Header Section */}
      <div className="w-full max-w-[1400px] mx-auto px-6 pt-20 md:pt-12 pb-12">
        {/* API Status */}
        {rateLimit && (
          <div className="absolute top-4 right-6">
            <div className="flex items-center gap-2 text-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${rateLimit.remaining > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-slate-600 dark:text-slate-400">
                  API Status: {rateLimit.remaining > 0 ? 'Active' : 'Rate Limited'}
                </span>
              </div>
              <span className="text-slate-500 dark:text-slate-500 border-l border-slate-200 dark:border-slate-700 pl-2">
                {rateLimit.remaining}/{rateLimit.limit} calls remaining
              </span>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Github className="w-12 h-12 text-slate-700 dark:text-slate-300" />
              <h1 className="text-5xl font-mono font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                GitSearch
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-mono">
              Discover profiles, repositories, and developer insights
            </p>
          </div>

          {/* Search Section */}
          <div className="w-full max-w-2xl mx-auto">
            <div className="relative">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Enter GitHub username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="pl-12 pr-24 h-14 text-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <Button
                    onClick={() => searchUser(searchQuery)}
                    disabled={loading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium text-base"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Searching</span>
                      </div>
                    ) : (
                      'Search'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full max-w-2xl mx-auto mt-6">
              <Card className="border-0 bg-red-50 dark:bg-red-900/20 shadow-lg">
                <CardContent className="p-4 text-center text-red-600 dark:text-red-400">
                  {error}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      {currentUser && !error && (
        <div className="w-full max-w-[1400px] mx-auto px-6 pb-12">
          <ProfileContent
            user={currentUser}
            repositories={repositories}
            organizations={organizations}
            languageFilter={languageFilter}
            sortBy={sortBy}
            getUniqueLanguages={getUniqueLanguages}
            setLanguageFilter={setLanguageFilter}
            setSortBy={setSortBy}
            setSortOrder={setSortOrder}
            sortOrder={sortOrder}
            hasMore={hasMore}
            loadMoreRepositories={loadMoreRepositories}
            languageColors={languageColors}
            formatDate={formatDate}
            filterAndSortRepositories={filterAndSortRepositories}
          />
        </div>
      )}
    </main>
  )
}
