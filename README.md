Code Colleague

Code Colleague is an AI-powered programming tutor designed for college and university students. It provides help with programming questions, debugging, code reviews, code explanations, and practice problems while encouraging students to understand the solution instead of simply copying it.

Learn to code, not just copy code.

This repository contains Phases 1 and 2 of the project. The AI Tutor, Hint Mode, Code Debugger, Code Review, Explain Code, Practice Generator, and Chat History are implemented end to end. Dashboard and Settings functionality are planned for Phase 3.

Features
AI Tutor: Ask programming questions about errors, concepts, algorithms, or code. Users can select Beginner, Intermediate, or Advanced difficulty levels. The tutor is designed to provide guidance and hints instead of immediately giving complete solutions.
Hint Mode: Provides a progressive Hint 1, Hint 2, Hint 3, and Solution workflow. Each hint is revealed individually so students can attempt the problem before seeing the answer.
Code Debugger: Submit Python, Java, C++, or C code with an optional error message and expected behavior. The debugger identifies the problem, explains why it occurs, provides a hint, and generates a suggested fix.
Code Review: Analyzes submitted code and categorizes findings as Critical, Warning, Improvement, or Suggestion. Each finding includes a location, explanation, and recommended improvement.
Explain Code: Breaks down code by providing a summary, inputs and outputs, edge cases, and time and space complexity. Detailed mode also provides a section-by-section explanation.
Practice Question Generator: Generates programming questions based on language, topic, difficulty, and question count. Each problem includes example input/output, constraints, hints, and a solution.
Chat History: Stores AI Tutor conversations in PostgreSQL and allows previous conversations to be viewed and continued.
Tech Stack

Frontend: Next.js 14, TypeScript, Tailwind CSS, Monaco Editor, lucide-react

Backend: FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic

Database: PostgreSQL

AI: Provider-independent LLMProvider architecture with Groq as the default provider and OpenAI as an alternative.

Architecture
                    ┌────────────────────────┐
                    │    Next.js Frontend    │
                    │                        │
                    │ Tutor / Debugger /     │
                    │ Review / Practice      │
                    └───────────┬────────────┘
                                │
                           REST / JSON
                                │
                    ┌───────────▼────────────┐
                    │     FastAPI Backend    │
                    │                        │
                    │ API Routes             │
                    │ Services               │
                    │ Validation             │
                    └───────┬─────────┬──────┘
                            │         │
                 ┌──────────▼───┐ ┌──▼──────────────┐
                 │ AI Services  │ │ LLM Providers   │
                 │              │ │                 │
                 │ Tutor        │ │ Groq            │
                 │ Debugger     │ │ OpenAI          │
                 │ Reviewer     │ │                 │
                 └──────┬───────┘ └─────────────────┘
                        │
                 ┌──────▼────────┐
                 │  PostgreSQL   │
                 └───────────────┘

The application separates API routes, AI services, LLM providers, database models, and validation logic. API routes handle requests and responses while the AI service layer contains the prompts and feature-specific logic.

LLM responses are parsed and validated using Pydantic schemas before being returned to the frontend. This prevents malformed model responses from being passed directly to the client.

The LLMProvider abstraction also keeps the application independent from a specific AI provider. Groq is used by default, while OpenAI can be selected through environment variables.

Project Structure
code-colleague/
├── backend/
│   ├── app/
│   │   ├── api/                  # FastAPI API routes
│   │   ├── core/                 # Configuration and database setup
│   │   ├── models/               # SQLAlchemy database models
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── ai/               # AI feature implementations
│   │   │   └── llm/              # LLM provider implementations
│   │   └── main.py
│   ├── alembic/                  # Database migration scaffolding
│   ├── tests/                    # Backend tests
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js pages
│   │   ├── components/           # Reusable UI components
│   │   ├── lib/                  # API client and utilities
│   │   └── types/                # TypeScript types
│   ├── Dockerfile
│   └── .env.local.example
├── docker-compose.yml
└── README.md
Setup
Option A: Docker

Docker is the recommended setup because it runs the frontend, backend, and PostgreSQL database together.

Create the backend environment file:

cp backend/.env.example backend/.env

Add your Groq API key to backend/.env:

GROQ_API_KEY=your_api_key

Create the frontend environment file:

cp frontend/.env.local.example frontend/.env.local

Start the application:

docker compose up --build

The application will be available at:

Frontend: http://localhost:3000
Backend:  http://localhost:8000
API Docs: http://localhost:8000/docs

To stop the containers:

docker compose down

To remove the PostgreSQL volume as well:

docker compose down -v
Option B: Run Locally
Backend
cd backend
python -m venv .venv

Windows:

.venv\Scripts\activate

macOS/Linux:

source .venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Create the environment file:

cp .env.example .env

Configure the Groq API key and PostgreSQL connection in .env.

Start the backend:

uvicorn app.main:app --reload
Frontend

Open another terminal:

cd frontend
npm install

Create the environment file:

cp .env.local.example .env.local

Start the development server:

npm run dev

The frontend will run at:

http://localhost:3000
Environment Variables
Backend

The backend environment variables are stored in backend/.env.

Variable	Description
LLM_PROVIDER	LLM provider to use, either groq or openai
GROQ_API_KEY	API key for Groq
GROQ_MODEL	Groq model used by the application
OPENAI_API_KEY	OpenAI API key when using OpenAI
OPENAI_MODEL	OpenAI model when using OpenAI
DATABASE_URL	PostgreSQL connection string
CORS_ORIGINS	Allowed frontend origins
Frontend

The frontend uses frontend/.env.local.

Variable	Description
NEXT_PUBLIC_API_BASE_URL	URL used to communicate with the FastAPI backend

Do not commit .env or .env.local files containing API keys or other secrets.

Adding an LLM Provider

The application uses an LLMProvider interface so different providers can be added without modifying the individual AI features.

To add another provider:

Create a provider implementation under backend/app/services/llm/.
Implement the LLMProvider interface.
Register the provider in factory.py.
Add any required configuration values to the application settings.
Update .env.example.

The AI services continue to call the provider abstraction rather than directly depending on a specific vendor SDK.

Adding a Debugger Language

The debugger supports multiple programming languages through a shared AI service.

To add another language:

Add the language to the Language schema.
Add it to the supported languages in the debugger API.
Add the corresponding language identifier to the Monaco Editor configuration.
Testing

Backend tests can be run with:

cd backend
pytest

The test suite uses a FakeLLMProvider so tests do not consume real API credits.

Tests cover:

Health endpoint
AI Tutor requests
Tutor session handling
Invalid LLM responses
Debugger responses
Hidden solution behavior
Code Review responses
Hint generation
Explain Code
Practice question validation
Chat history
Unknown chat session handling
API Overview

All API routes are available under /api/v1.

Method	Endpoint	Description
GET	/health	Returns service and LLM provider status
POST	/tutor	Sends a question to the AI Tutor
GET	/tutor/sessions	Lists previous tutor conversations
GET	/tutor/sessions/{id}	Retrieves a conversation transcript
GET	/debugger/languages	Lists supported debugger languages
POST	/debugger	Analyzes and explains programming errors
POST	/review	Reviews submitted code
POST	/hint	Generates a progressive hint sequence
POST	/explain	Explains submitted code
POST	/practice	Generates programming practice questions

Interactive API documentation is available at:

http://localhost:8000/docs
Roadmap
Phase 3
Student dashboard
Recent learning activity
Weak-topic detection
User profiles
Application settings
Phase 4
RAG using uploaded course notes and lecture PDFs
Sandboxed code execution
GitHub integration
Personalized learning paths
Additional programming languages
Project Notes

Authentication is intentionally not included in Phases 1 and 2. Database models already include optional user relationships so authentication can be added later without redesigning the database structure.

Redis, Celery, and pgvector are not currently used because the existing features do not require background processing or vector search.

The Practice Generator returns hints and solutions as part of the API response, while the frontend controls when they are displayed. This can be changed later if server-side solution protection becomes necessary.
