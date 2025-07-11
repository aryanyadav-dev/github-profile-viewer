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

  const calculateDiversityScore = () => {
    if (repositories.length === 0) return 0;  // Return 0 if no repositories

    // Calculate language diversity (45% of score)
    const languages = new Set();
    repositories.forEach(repo => {
      if (repo.language) languages.add(repo.language);
    });
    const languageScore = Math.min(100, languages.size * 15);

    // Calculate topic diversity (30% of score)
    const topics = new Set();
    repositories.forEach(repo => {
      if (repo.topics) {
        repo.topics.forEach((topic: string) => topics.add(topic));
      }
    });
    const topicScore = Math.min(100, topics.size * 10);

    // Repository count score (25% of score)
    const repoScore = Math.min(100, repositories.length * 5);

    // Calculate weighted final score
    const score = (
      (languageScore * 0.45) +  // 45% weight for languages
      (topicScore * 0.30) +     // 30% weight for topics
      (repoScore * 0.25)        // 25% weight for repository count
    );

    return Math.round(Math.max(0, Math.min(100, score)));  // Ensure score is between 0 and 100
  };

  const calculateActivityScore = () => {
    if (repositories.length === 0) return 0;  // Return 0 if no repositories

    const now = new Date();
    const createdAt = new Date(userData.created_at);
    const accountAge = Math.max(0.1, (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365)); // Minimum 0.1 years to prevent division by zero
    
    const commitsPerYear = repositories.reduce((total, repo) => {
      return total + (repo.commits_count || 0);
    }, 0) / accountAge;

    const contributionDensity = userData.public_repos / accountAge;
    
    let score = Math.min(100, 
      (commitsPerYear / 200) * 40 + 
      (contributionDensity * 30) +
      (userData.public_repos > 0 ? 30 : 0)
    );
    
    return Math.round(Math.max(0, score));  // Ensure score is not negative
  };

  const calculateCodeQualityScore = () => {
    if (repositories.length === 0) return 0;  // Return 0 if no repositories

    const totalStars = repositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const avgStars = totalStars / repositories.length;
    
    const hasReadme = repositories.filter(repo => repo.has_readme).length;
    const readmeRatio = repositories.length > 0 ? hasReadme / repositories.length : 0;
    
    const hasDescription = repositories.filter(repo => repo.description).length;
    const descriptionRatio = repositories.length > 0 ? hasDescription / repositories.length : 0;

    let score = Math.min(100,
      (avgStars * 10) +
      (readmeRatio * 40) +
      (descriptionRatio * 30) +
      (userData.bio ? 20 : 0)
    );

    return Math.round(Math.max(0, score));  // Ensure score is not negative
  };

  const calculateCollaborationScore = () => {
    if (repositories.length === 0) return 0;  // Return 0 if no repositories

    const forksReceived = repositories.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
    const pullRequests = repositories.reduce((sum, repo) => sum + (repo.pull_requests_count || 0), 0);
    const issues = repositories.reduce((sum, repo) => sum + (repo.issues_count || 0), 0);

    let score = Math.min(100,
      (forksReceived * 5) +
      (pullRequests * 10) +
      (issues * 5) +
      (userData.followers * 2)
    );

    return Math.round(Math.max(0, Math.min(100, score)));  // Ensure score is between 0 and 100
  };

  const calculateImpactScore = () => {
    if (repositories.length === 0) return 0;  // Return 0 if no repositories

    const totalStars = repositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const totalWatchers = repositories.reduce((sum, repo) => sum + (repo.watchers_count || 0), 0);
    const totalForks = repositories.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);

    let score = Math.min(100,
      (totalStars * 2) +
      (totalWatchers * 3) +
      (totalForks * 5) +
      (userData.followers * 2)
    );

    return Math.round(Math.max(0, score));  // Ensure score is not negative
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
    <Card className="w-full">
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