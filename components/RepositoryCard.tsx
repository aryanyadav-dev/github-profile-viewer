import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, GitFork, LinkIcon } from 'lucide-react'

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
}

interface RepositoryCardProps {
  repository: Repository
  languageColors: { [key: string]: string }
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository, languageColors }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card className="h-[250px] hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 ease-in-out border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl overflow-hidden">
        <CardContent className="p-6 h-full flex flex-col">
          {/* Basic Info */}
          <div className="flex-grow">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <a
                href={repository.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group"
              >
                <span className="line-clamp-1">{repository.name}</span>
                <LinkIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out" />
              </a>
            </h3>
            {repository.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-3">
                {repository.description}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {/* Topics */}
            {repository.topics && repository.topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {repository.topics.slice(0, 3).map((topic) => (
                  <Badge 
                    key={topic} 
                    variant="secondary" 
                    className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors rounded-full"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                {repository.language && (
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: languageColors[repository.language] || '#6b7280',
                      }}
                    />
                    <span className="text-slate-600 dark:text-slate-400">{repository.language}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1 hover:text-yellow-500 transition-colors">
                  <Star className="w-4 h-4" />
                  {repository.stargazers_count}
                </div>
                <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                  <GitFork className="w-4 h-4" />
                  {repository.forks_count}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default RepositoryCard 