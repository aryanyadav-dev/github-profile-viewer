# GitHub Profile Viewer

A sleek and interactive web application built with Next.js that allows users to search and view GitHub profiles, including their public repositories and starred repositories.

## Features

- **User Search**: Quickly find any GitHub user by their username.
- **Profile Overview**: Displays key user information such as name, bio, location, company, blog, and join date.
- **GitHub Statistics**: Shows public repositories, followers, and following counts.
- **Public Repositories**: Lists a selection of the user's public repositories with details like description, language, stars, and forks.
- **Starred Repositories**: Displays repositories the user has starred, offering more insights into their interests.
- **Responsive Design**: Optimized for various screen sizes, from mobile to desktop.
- **Modern UI**: Built with Radix UI components styled using Tailwind CSS for a polished look and feel.
- **Smooth Animations**: Enhances user experience with subtle animations powered by Framer Motion.

## Technologies Used

- **Next.js**: React framework for production.
- **React**: Frontend JavaScript library.
- **TypeScript**: Typed JavaScript for better code quality and maintainability.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Radix UI**: Unstyled, accessible UI components (used via `shadcn/ui`).
- **Framer Motion**: A production-ready motion library for React.
- **Lucide React**: Beautifully simple, accessible open-source icons.
- **date-fns**: Modern JavaScript date utility library.

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (version 18 or higher) and [pnpm](https://pnpm.io/) installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/github-profile-viewer.git
    cd github-profile-viewer
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

### Running the Development Server

To start the development server:

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

To create an optimized production build:

```bash
pnpm build
# or
npm run build
```

You can then run the production build:

```bash
pnpm start
# or
npm start
```

## Usage

1.  Enter a GitHub username into the search bar.
2.  Press `Enter` or click the "Search" button.
3.  View the user's profile information, public repositories, and starred repositories.

## Potential Improvements

Here are some ideas for further enhancing the project:

-   **User Activity/Contributions Graph**: Visualize a user's contributions over time.
-   **Organization & Gists Display**: Show organizations a user belongs to and their public gists.
-   **Repository Filtering & Sorting**: Add options to filter repositories by language or sort by various criteria.
-   **Pagination/Infinite Scrolling**: Implement loading more repositories as the user scrolls.
-   **Rate Limit Handling**: Implement more robust handling for GitHub API rate limits.
-   **Dark Mode Toggle**: A dedicated UI switch for dark/light mode.

