# AI Powered Fitness Tracker

A cutting-edge fitness application that leverages the power of generative AI to provide a deeply personalized health and wellness experience. This app serves as your all-in-one fitness companion, offering everything from tailored workout plans to intelligent nutritional analysis.

## Key Features

- **Personalized Dashboard**: Get a comprehensive overview of your daily progress, including activity logs, goal tracking, and AI-powered forecasts.
- **AI Workout Planner**: Generate custom workout plans based on your fitness level, goals, and available equipment.
- **Exercise Library**: Browse a rich library of exercises with detailed instructions and video demonstrations.
- **AI Form Check**: Upload a video of your exercise to receive instant, AI-driven feedback on your form, helping you exercise safely and effectively.
- **Nutrition Tracking**: Log meals with a photo and get an instant AI analysis of calories and macronutrients. Receive smart nutrition tips and recipe suggestions.
- **Voice Journaling**: Record your thoughts and feelings, and let our AI provide insights into your mood and summarize your entries.
- **AI Fitness Coach**: Ask fitness-related questions in natural language and get immediate, helpful responses from your AI coach.
- **Progress Reports**: View daily and weekly reports with AI-powered summaries to track your progress and stay motivated.

## Tech Stack

This project is built with a modern, robust, and scalable technology stack:

- **Frontend**: [Next.js](https://nextjs.org/) with React and TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/) for a sleek, responsive, and accessible user interface.
- **Generative AI**: [Google's Gemini models](https://deepmind.google/technologies/gemini/) via the [Genkit](https://firebase.google.com/docs/genkit) framework.
- **Backend & Authentication**: [Firebase](https://firebase.google.com/) for user authentication and data persistence.
- **Deployment**: Hosted on [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).

## Getting Started

To run the project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Firebase and Genkit API keys.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
