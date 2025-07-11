"use client"

import React, { useState } from "react"
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
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
}

interface Repository {
  id: number
  name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string
  updated_at: string
  topics: string[]
}

const languageColors: { [key: string]: string } = {
  JavaScript: "#f1e05a",
  TypeScript: "#2b7489",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#239120",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Go: "#00ADD8",
  Rust: "#dea584",
  Swift: "#ffac45",
  Kotlin: "#F18E33",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#1572B6",
  Vue: "#4FC08D",
  React: "#61DAFB",
}

export default function GitHubProfileViewer() {
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [starredRepositories, setStarredRepositories] = useState<Repository[]>([]) // New state for starred repos
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const searchUser = async () => {
    if (!searchQuery.trim()) {
      return
    }

    setLoading(true)
    setError("")

    try {
      // Fetch user data
      const userResponse = await fetch(`https://api.github.com/users/${searchQuery}`)
      if (!userResponse.ok) {
        throw new Error("User not found")
      }
      const userData = await userResponse.json()
      setUser(userData)

      // Fetch public repositories
      const reposResponse = await fetch(
        `https://api.github.com/users/${searchQuery}/repos?sort=updated&per_page=12`,
      )
      const reposData = await reposResponse.json()
      setRepositories(reposData)

      // Fetch starred repositories
      const starredReposResponse = await fetch(
        `https://api.github.com/users/${searchQuery}/starred?sort=updated&per_page=12`,
      )
      const starredReposData = await starredReposResponse.json()
      setStarredRepositories(starredReposData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setUser(null)
      setRepositories([])
      setStarredRepositories([]) // Clear starred repos on error
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchUser()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
              GitHub Profile Viewer
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Discover GitHub profiles, repositories, and developer insights
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchQuery(e.target.value)
              }}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-20 h-12 text-lg border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-lg"
            />
            <Button
              onClick={searchUser}
              disabled={loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg"
            >
              {loading ? "..." : "Search"}
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
                <CardContent className="p-4 text-center text-red-600 dark:text-red-400">{error}</CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Profile */}
        <AnimatePresence>
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Profile Header */}
              <Card className="overflow-hidden border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                      <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-700 shadow-lg">
                        <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>{user.login[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </motion.div>

                    <div className="flex-1 text-center md:text-left">
                      <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2"
                      >
                        {user.name || user.login}
                      </motion.h2>

                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-600 dark:text-slate-400 text-lg mb-4"
                      >
                        @{user.login}
                      </motion.p>

                      {user.bio && (
                        <motion.p
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="text-slate-700 dark:text-slate-300 mb-4 text-lg"
                        >
                          {user.bio}
                        </motion.p>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6"
                      >
                        {user.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {user.location}
                          </div>
                        )}
                        {user.company && (
                          <div className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {user.company}
                          </div>
                        )}
                        {user.blog && (
                          <div className="flex items-center gap-1">
                            <LinkIcon className="w-4 h-4" />
                            <a
                              href={user.blog}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-500"
                            >
                              {user.blog}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Joined {formatDate(user.created_at)}
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
                            {user.public_repos}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Repositories</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{user.followers}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Followers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{user.following}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Following</div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Public Repositories */}
              {repositories.length > 0 && (
                <div>
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6"
                  >
                    Public Repositories
                  </motion.h3>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {repositories.map((repo: Repository, index: number) => (
                      <motion.div
                        key={repo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm group hover:scale-105">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                {repo.name}
                                <LinkIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {repo.description && (
                              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                                {repo.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4">
                                {repo.language && (
                                  <div className="flex items-center gap-1">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: languageColors[repo.language] || "#6b7280" }}
                                    />
                                    <span className="text-slate-600 dark:text-slate-400">{repo.language}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4" />
                                  {repo.stargazers_count}
                                </div>
                                <div className="flex items-center gap-1">
                                  <GitFork className="w-4 h-4" />
                                  {repo.forks_count}
                                </div>
                              </div>
                            </div>

                            {repo.topics && repo.topics.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {repo.topics.slice(0, 3).map((topic: string) => (
                                  <Badge key={topic} variant="secondary" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Updated {formatDate(repo.updated_at)}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Starred Repositories (New Section) */}
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
                        <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm group hover:scale-105">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                {repo.name}
                                <LinkIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {repo.description && (
                              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                                {repo.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4">
                                {repo.language && (
                                  <div className="flex items-center gap-1">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: languageColors[repo.language] || "#6b7280" }}
                                    />
                                    <span className="text-slate-600 dark:text-slate-400">{repo.language}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4" />
                                  {repo.stargazers_count}
                                </div>
                                <div className="flex items-center gap-1">
                                  <GitFork className="w-4 h-4" />
                                  {repo.forks_count}
                                </div>
                              </div>
                            </div>
                            {repo.topics && repo.topics.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {repo.topics.slice(0, 3).map((topic: string) => (
                                  <Badge key={topic} variant="secondary" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Updated {formatDate(repo.updated_at)}
                            </div>
                          </CardContent>
                        </Card>
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
