# Mock Minds

Mock Minds is an AI-powered mock interview platform designed to help users prepare for interviews by providing instant feedback. Built using modern web technologies like Next.js, Tailwind CSS, Clerk for authentication, and Drizzle ORM for database management, Mock Minds offers a seamless user experience for conducting mock interviews and tracking progress.

## Features

- **AI Mock Interview:** Conduct mock interviews with AI-generated questions and receive real-time feedback.
- **User Authentication:** Secure sign-up and login powered by Clerk.
- **Question Management:** Dynamically generate and manage questions using Drizzle ORM.
- **Real-Time Speech Recognition:** Implemented with `react-hook-speech-to-text` for hands-free user responses.
- **Webcam Integration:** Uses `react-webcam` to simulate real interview settings.
- **Responsive Design:** Styled using Tailwind CSS with custom animations.

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Authentication:** Clerk
- **Database:** Drizzle ORM, Neon (serverless PostgreSQL)
- **Speech Recognition:** `react-hook-speech-to-text`
- **UI Components:** Radix UI, TailwindCSS Forms, Shadcn UI

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- Neon Database account
- Clerk account for authentication

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/seeranjeeviramavel/mockminds.git
    cd mock-minds
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:

    Create a `.env.local` file in the root directory and add your Clerk and Neon Database credentials:

    ```bash
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_DRIZZLE_DB_URL=your_neon_db_url
    NEXT_PUBLIC_MAX_QUESTIONS=10
    ```

4. Run the development server:

    ```bash
    npm run dev
    ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

1. Register or log in using Clerk.
2. Start a mock interview session and answer questions using speech or text input.
3. Review feedback after each question and improve your performance.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Create a new Pull Request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Contact

For any inquiries or issues, please reach out to seeranjeeviramavel@gmail.com.
