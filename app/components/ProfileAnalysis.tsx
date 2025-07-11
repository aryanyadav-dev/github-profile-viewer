import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalysisMetric {
  name: string;
  score: number;
  description: string;
}

interface ProfileAnalysisProps {
  userData: any;
  repositories: any[];
}

export function ProfileAnalysis({ userData, repositories }: ProfileAnalysisProps) {
  const [metrics, setMetrics] = useState<AnalysisMetric[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    analyzeProfile();
  }, [userData, repositories]);

  const analyzeProfile = () => {
    const analysisMetrics: AnalysisMetric[] = [];
    let totalScore = 0;

    // Activity Level Analysis
    const activityScore = calculateActivityScore();
    analysisMetrics.push({
      name: "Activity Level",
      score: activityScore,
      description: getActivityDescription(activityScore)
    });

    // Code Quality Analysis
    const codeQualityScore = calculateCodeQualityScore();
    analysisMetrics.push({
      name: "Code Quality",
      score: codeQualityScore,
      description: getCodeQualityDescription(codeQualityScore)
    });

    // Collaboration Score
    const collaborationScore = calculateCollaborationScore();
    analysisMetrics.push({
      name: "Collaboration",
      score: collaborationScore,
      description: getCollaborationDescription(collaborationScore)
    });

    // Project Diversity Score
    const diversityScore = calculateDiversityScore();
    analysisMetrics.push({
      name: "Project Diversity",
      score: diversityScore,
      description: getDiversityDescription(diversityScore)
    });

    // Impact Score
    const impactScore = calculateImpactScore();
    analysisMetrics.push({
      name: "Community Impact",
      score: impactScore,
      description: getImpactDescription(impactScore)
    });

    totalScore = analysisMetrics.reduce((acc, metric) => acc + metric.score, 0) / analysisMetrics.length;
    
    setMetrics(analysisMetrics);
    setOverallScore(Math.round(totalScore));
  };

  const calculateActivityScore = () => {
    const now = new Date();
    const createdAt = new Date(userData.created_at);
    const accountAge = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    // Calculate average commits per repository
    const totalCommits = repositories.reduce((total, repo) => {
      return total + (repo.commits_count || 0);
    }, 0);
    
    // More strict commits per year calculation
    const commitsPerYear = totalCommits / accountAge;
    const commitsScore = Math.min(100, (commitsPerYear / 500) * 40); // Requires 500 commits/year for max score
    
    // Calculate contribution density (repos per year)
    const contributionDensity = userData.public_repos / accountAge;
    const densityScore = Math.min(100, (contributionDensity / 12) * 30); // Requires 12 repos/year for max score
    
    // Calculate recency score (percentage of repos updated in last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentRepos = repositories.filter(repo => {
      const lastUpdate = new Date(repo.updated_at);
      return lastUpdate > threeMonthsAgo;
    }).length;
    
    const recencyScore = (recentRepos / repositories.length) * 30;
    
    let score = commitsScore + densityScore + recencyScore;
    
    // Additional penalties
    if (accountAge < 1) score *= 0.7; // Penalty for new accounts
    if (repositories.length < 5) score *= 0.8; // Penalty for few repositories
    
    return Math.round(score);
  };

  const calculateCodeQualityScore = () => {
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const avgStars = totalStars / repositories.length || 0;
    
    const hasReadme = repositories.filter(repo => repo.has_readme).length;
    const readmeRatio = hasReadme / repositories.length;
    
    const hasDescription = repositories.filter(repo => repo.description).length;
    const descriptionRatio = hasDescription / repositories.length;

    let score = Math.min(100,
      (avgStars * 10) +
      (readmeRatio * 40) +
      (descriptionRatio * 30) +
      (userData.bio ? 20 : 0)
    );

    return Math.round(score);
  };

  const calculateCollaborationScore = () => {
    const forksReceived = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
    const pullRequests = repositories.reduce((sum, repo) => sum + (repo.pull_requests_count || 0), 0);
    const issues = repositories.reduce((sum, repo) => sum + (repo.issues_count || 0), 0);

    let score = Math.min(100,
      (forksReceived * 5) +
      (pullRequests * 10) +
      (issues * 5) +
      (userData.followers * 2)
    );

    return Math.round(Math.min(score, 100));
  };

  const calculateDiversityScore = () => {
    // Calculate language diversity
    const languages = new Set();
    const languageCounts: Record<string, number> = {};
    
    repositories.forEach(repo => {
      if (repo.language) {
        languages.add(repo.language);
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    });

    // Calculate language distribution score
    const totalRepos = repositories.length;
    const languageDistribution = Object.values(languageCounts).map(count => count / totalRepos);
    const distributionScore = 1 - Math.max(...languageDistribution);
    
    // Calculate weighted language score (more languages = higher score, but with diminishing returns)
    const languageScore = Math.min(100, (Math.log2(languages.size + 1) / Math.log2(11)) * 45);
    
    // Calculate topic diversity
    const topics = new Set();
    const topicCounts: Record<string, number> = {};
    
    repositories.forEach(repo => {
      if (repo.topics) {
        repo.topics.forEach((topic: string) => {
          topics.add(topic);
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        });
      }
    });

    // Calculate topic distribution score
    const topicDistribution = Object.values(topicCounts).map(count => count / totalRepos);
    const topicDistributionScore = 1 - Math.max(...topicDistribution);
    
    // Calculate weighted topic score
    const topicScore = Math.min(100, (Math.log2(topics.size + 1) / Math.log2(16)) * 30);
    
    // Project size diversity (small, medium, large projects)
    const sizeCategories = {
      small: 0,
      medium: 0,
      large: 0
    };
    
    repositories.forEach(repo => {
      if (repo.size < 1000) sizeCategories.small++;
      else if (repo.size < 10000) sizeCategories.medium++;
      else sizeCategories.large++;
    });
    
    const sizeDiversityScore = Math.min(
      25,
      (sizeCategories.small > 0 ? 8 : 0) +
      (sizeCategories.medium > 0 ? 8 : 0) +
      (sizeCategories.large > 0 ? 9 : 0)
    );

    let score = 
      languageScore * (0.7 + 0.3 * distributionScore) + // Language score with distribution factor
      topicScore * (0.7 + 0.3 * topicDistributionScore) + // Topic score with distribution factor
      sizeDiversityScore; // Project size diversity

    // Penalties
    if (languages.size === 1) score *= 0.7; // Single language penalty
    if (topics.size < 3) score *= 0.8; // Few topics penalty
    if (repositories.length < 5) score *= 0.8; // Few repositories penalty

    return Math.round(Math.min(100, score));
  };

  const calculateImpactScore = () => {
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalWatchers = repositories.reduce((sum, repo) => sum + repo.watchers_count, 0);
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);

    let score = Math.min(100,
      (totalStars * 2) +
      (totalWatchers * 3) +
      (totalForks * 5) +
      (userData.followers * 2)
    );

    return Math.round(Math.min(score, 100));
  };

  const getActivityDescription = (score: number) => {
    if (score >= 80) return "Highly active with regular contributions";
    if (score >= 60) return "Moderately active contributor";
    if (score >= 40) return "Occasional contributor";
    return "Could be more active in contributions";
  };

  const getCodeQualityDescription = (score: number) => {
    if (score >= 80) return "Excellent code documentation and organization";
    if (score >= 60) return "Good code quality practices";
    if (score >= 40) return "Basic code quality standards met";
    return "Could improve code documentation";
  };

  const getCollaborationDescription = (score: number) => {
    if (score >= 80) return "Highly collaborative with strong community engagement";
    if (score >= 60) return "Good collaboration with others";
    if (score >= 40) return "Some collaborative activity";
    return "Could engage more with the community";
  };

  const getDiversityDescription = (score: number) => {
    if (score >= 80) return "Diverse portfolio with multiple technologies";
    if (score >= 60) return "Good range of project types";
    if (score >= 40) return "Some variety in projects";
    return "Could explore more technologies";
  };

  const getImpactDescription = (score: number) => {
    if (score >= 80) return "High impact on the community";
    if (score >= 60) return "Notable community influence";
    if (score >= 40) return "Growing community impact";
    return "Building community presence";
  };

  return (
    <Card className="w-full mt-6">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">AI Profile Analysis</h2>
        <div className="space-y-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold">Overall Score</span>
              <span className="text-2xl font-bold">{overallScore}/100</span>
            </div>
            <Progress value={overallScore} className="h-2" />
          </div>
          
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{metric.name}</span>
                <span className="font-semibold">{metric.score}/100</span>
              </div>
              <Progress value={metric.score} className="h-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">{metric.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 