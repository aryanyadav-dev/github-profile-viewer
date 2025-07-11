# Gitviewer

A powerful, AI-enhanced GitHub profile analysis tool built with Next.js that provides deep insights into GitHub profiles, repositories, and development patterns.

## Features

- **AI-Powered Profile Analysis**: Advanced analysis of GitHub profiles with dynamic scoring across multiple metrics:
  - **Activity Level** (100-point scale):
    - Evaluates contribution frequency
    - Analyzes commit density
    - Tracks repository creation rate
    - Weighted factors: Commits per year (40%), contribution density (30%), public repos (30%)

  - **Code Quality** (100-point scale):
    - Analyzes documentation completeness
    - Evaluates project descriptions
    - Measures project popularity
    - Weighted factors: README presence (40%), descriptions (30%), bio (20%), average stars (10%)

  - **Collaboration** (100-point scale):
    - Measures community interaction
    - Analyzes pull request patterns
    - Tracks issue engagement
    - Weighted factors: Pull Requests (50%), Forks (25%), Issues (25%)

  - **Project Diversity** (100-point scale):
    - Evaluates programming language variety
    - Analyzes project topics
    - Considers repository count
    - Weighted factors: Languages (45%), Topics (30%), Repository count (25%)

  - **Community Impact** (100-point scale):
    - Assesses overall influence
    - Measures project reach
    - Analyzes community engagement
    - Weighted factors: Forks (50%), Watchers (30%), Stars (20%)

- **Dynamic Analysis Engine**:
  - Real-time calculation of metrics
  - Contextual scoring based on GitHub ecosystem
  - Personalized improvement suggestions
  - Automatic updates with new data

- **Profile Features**:
  - Quick user search by username
  - Comprehensive profile overview
  - GitHub statistics and metrics
  - Organization memberships
  - Location and contact information

- **Repository Management**:
  - Public repositories list with filtering
  - Starred repositories showcase
  - Language and topic analysis
  - Repository statistics and metrics

- **Advanced UI/UX**:
  - Interactive progress bars
  - Dynamic score updates
  - Contextual feedback
  - Responsive design
  - Dark mode support
  - Smooth animations

## Technologies Used

- **Next.js**: React framework for production
- **React**: Frontend JavaScript library
- **TypeScript**: Typed JavaScript for better code quality
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible components
- **Framer Motion**: Production-ready animations
- **GitHub API**: Data source for analysis
- **Custom Analytics Engine**: AI-powered profile scoring

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm or pnpm package manager
- GitHub Personal Access Token (for API access)

### GitHub Token Setup

1. Create a GitHub Personal Access Token:
   - Go to GitHub Settings > Developer Settings > Personal Access Tokens > Tokens (classic)
   - Click "Generate new token (classic)"
   - Give it a name (e.g., "Gitviewer App")
   - Select scopes: `public_repo`, `read:user`, `read:org`
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
   git clone https://github.com/your-username/gitviewer.git
   cd gitviewer
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
2. View comprehensive profile analysis including:
   - Overall profile score
   - Individual metric scores
   - Detailed breakdowns of each category
   - Personalized improvement suggestions
3. Explore repositories and contributions
4. Review technical diversity and impact metrics

## How the AI Analysis Works

The AI analysis engine evaluates GitHub profiles across multiple dimensions:

1. **Activity Analysis**:
   - Calculates commit frequency
   - Analyzes contribution patterns
   - Evaluates repository creation rate
   - Considers account age and consistency

2. **Code Quality Assessment**:
   - Reviews documentation practices
   - Evaluates project descriptions
   - Analyzes repository structure
   - Considers community reception

3. **Collaboration Metrics**:
   - Tracks pull request patterns
   - Analyzes issue engagement
   - Evaluates community interaction
   - Measures project maintenance

4. **Technical Diversity**:
   - Maps language proficiency
   - Analyzes project topics
   - Evaluates technical range
   - Considers project variety

5. **Community Impact**:
   - Measures project adoption
   - Analyzes community growth
   - Evaluates user influence
   - Tracks project success

Each metric is calculated using weighted factors and normalized to a 100-point scale, providing comprehensive insights into a developer's GitHub presence.



