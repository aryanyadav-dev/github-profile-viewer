# GitSearch

A modern, elegant GitHub profile viewer that provides a seamless experience for exploring GitHub profiles and repositories. Built with Next.js and featuring a beautiful, responsive design with real-time API status monitoring.

## Features

- **Modern UI/UX**:
  - Beautiful blue-indigo gradient theme throughout the interface
  - Elegant search bar with gradient-styled button
  - Dark mode support with custom favicon
  - Retro-styled developer attribution card
  - Responsive design for all screen sizes

- **Profile Features**:
  - Quick user search by username
  - Comprehensive profile overview
  - Real-time GitHub API status indicator
  - Complete repository listing (up to API rate limit)
  - Repository count display

- **Repository Display**:
  - Enhanced repository fetching (100 repositories per page)
  - Clean and organized repository cards
  - Repository statistics and metrics
  - Optimized loading performance

- **Technical Features**:
  - Real-time API rate limit monitoring
  - SEO-friendly with proper metadata
  - Custom SVG favicon with dark mode support

**AI Integration**:
Analyzes GitHub profiles based on 5 key metrics:
* Activity Level: Evaluates contribution frequency, commit density, and repository creation rate
* Code Quality: Analyzes documentation, descriptions, and project popularity
* Collaboration: Measures community interaction through PRs, issues, and forks
* Project Diversity: Evaluates the variety of programming languages and topics
* Community Impact: Assesses overall influence through stars, watchers, and followers  
1. The analysis is dynamic and considers:
    * Account age and activity patterns
    * Repository quality and documentation
    * Community engagement metrics
    * Technical diversity
    * Project impact and reach 
2. Each metric is calculated using multiple factors and weighted appropriately:
    * Activity Level: Commits per year (40%), contribution density (30%), having public repos (30%)
    * Code Quality: Average stars (10%), README presence (40%), descriptions (30%), bio (20%)
    * Collaboration: Forks (25%), PRs (50%), issues (25%)
    * Project Diversity: Languages (45%), topics (30%), repository count (25%)
    * Community Impact: Stars (20%), watchers (30%), forks (50%) 
3. The UI shows:
    * An overall score
    * Individual metric scores with progress bars
    * Contextual descriptions that change based on the score
    * A modern, clean design that matches the app's aesthetic

## Technologies Used

- **Next.js**: React framework for production
- **React**: Frontend JavaScript library
- **TypeScript**: Typed JavaScript for better code quality
- **Tailwind CSS**: Utility-first CSS framework
- **GitHub API**: Data source for repositories and profiles

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm or pnpm package manager
- GitHub Personal Access Token (for API access)

### GitHub Token Setup

1. Create a GitHub Personal Access Token:
   - Go to GitHub Settings > Developer Settings > Personal Access Tokens > Tokens (classic)
   - Click "Generate new token (classic)"
   - Give it a name (e.g., "GitSearch")
   - Select scopes: `read:user`, `read:org`, `public_repo`
   - Click "Generate token"
   - Copy the token immediately (you won't see it again!)

2. Create a `.env.local` file in the project root:
   ```bash
   echo "NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here" > .env.local
   ```
   Replace `your_github_token_here` with your actual GitHub token.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/github-profile-viewer.git
   cd github-profile-viewer
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

1. Enter a GitHub username in the search bar
2. View the user's profile information including:
   - Profile details and statistics
   - Complete list of public repositories
   - Repository count and details
3. Monitor the API rate limit status through the indicator




