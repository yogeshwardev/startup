# CampusArena AI Build Specification

## 1. Purpose of This File

This document is the single source of truth for building the startup product in this repository.

If an AI agent, engineer, or product team reads only one file before continuing development, it should be this one.

This specification is based on the current repository state in `E:\STARTUP` and is written to be implementation-oriented, not marketing-oriented.

Use this file to:

- understand what the startup is
- understand who the users are
- understand what each module must do
- understand how the frontend, backend, data, and infrastructure should work
- continue building the product without needing additional context

If any older document conflicts with this file, follow this file.

---

## 2. Startup Summary

### Product Name

**CampusArena**

### One-Line Description

CampusArena is a campus-focused coding, placement-preparation, mock-test, analytics, and role-based learning platform for students, teachers, and admins.

### Core Idea

Most students preparing for internships and placements use scattered resources:

- coding practice on one platform
- aptitude preparation on another
- company interview prep from random blogs or PDFs
- progress monitoring manually through teachers

CampusArena combines these into one college-specific platform with:

- coding practice
- company-wise placement preparation
- mock tests
- leaderboards
- department competitions
- teacher oversight
- admin content and user management
- secure code execution

### Primary Value Proposition

For students:

- one place to practice coding and placement prep
- see personal progress and ranking
- prepare by company

For teachers:

- monitor student performance
- assign problems
- track readiness

For admins/institutions:

- manage users, problems, companies, and mock tests
- run a campus-wide competitive coding ecosystem

---

## 3. Problem Being Solved

### Current Pain Points

- Students do not have a structured campus-specific preparation workflow.
- Teachers cannot easily track real progress across coding, contests, and placement readiness.
- Colleges lack a centralized internal platform for coding practice and placement preparation.
- Company-wise preparation is fragmented and not mapped to actual hiring patterns.
- Mock tests, question banks, and analytics are often disconnected.

### Solution

CampusArena provides a unified platform with:

- secure coding practice
- daily challenges
- contests
- company-specific preparation hubs
- aptitude and interview question banks
- mock tests
- role-based dashboards
- analytics and leaderboard systems

---

## 4. Target Users

### Students

Students are the primary end users. They log in, practice problems, take mock tests, prepare by company, track rank, and update their profile.

### Teachers

Teachers supervise student progress, review analytics, manage practice activity, assign problems, and manage mock tests in the academic context.

### Admins

Admins manage platform-wide operations including user onboarding, problem management, placement company management, question banks, and analytics.

---

## 5. Product Goals

### MVP Goals

- Provide secure coding problem solving with code execution and submission evaluation.
- Provide a role-based experience for Student, Teacher, and Admin.
- Provide company-wise placement preparation.
- Provide mock tests and basic performance tracking.
- Provide dashboards and leaderboards.
- Support college-only registration and onboarding.

### Success Metrics

- Daily active students
- Number of problems attempted and solved
- Mock test completion rate
- Placement hub engagement by company
- Teacher usage for monitoring and assignments
- Leaderboard participation

### Non-Goals for MVP

- public marketplace outside colleges
- recruiter portal
- payment or subscription system
- advanced proctoring with webcam/audio
- native mobile app

---

## 6. User Roles and Permissions

### Student

Student users can:

- register and log in
- view dashboard
- browse and solve problems
- run code and submit solutions
- view submissions
- join/view contests
- view leaderboards
- view department war standings
- access placement hub
- browse company-specific questions
- take mock tests
- view profile, settings, analytics, and connections

Student users cannot:

- manage users
- create/edit/delete core problem bank entries
- manage platform analytics as an admin

### Teacher

Teacher users can:

- access teacher dashboard
- view users/student roster
- view departments
- manage or review problems relevant to teaching
- create/manage mock tests
- view analytics
- assign problems to students
- contact admin

Teacher users cannot:

- perform full admin-only destructive management
- delete the whole platform content unless explicitly allowed by role and route

### Admin

Admin users can:

- manage all users
- bulk create users
- reset passwords
- manage problems
- manage existing problem inventory
- manage contests
- manage mock tests
- manage placement companies
- manage placement question banks
- access platform analytics and summary
- inspect audit logs

---

## 7. Product Modules

## 7.1 Authentication and Access Control

### Required Behavior

- Users can register with college email validation.
- Users can log in with email and password.
- JWT-based authentication is used.
- Routes are protected.
- UI access is role-aware.
- Blocked users must not be able to continue using protected product features.

### Current Backend Endpoints

- `POST /api/register`
- `POST /api/login`

### Validation Rules

- email must be valid
- password minimum length is 8
- user role must be one of the allowed role constants
- admin-created emails must match a college-domain pattern

---

## 7.2 Student Experience

### Student Dashboard

The student dashboard is the home screen after login for student users.

It should show:

- summary of solved problems
- recent performance
- leaderboard snapshot
- department rank snapshot
- daily challenge
- quick links to problems, contests, and placement hub

### Problems Module

Students must be able to:

- browse problems
- filter by difficulty and tags
- open a problem workspace
- read statement, constraints, examples, input/output format
- write code in supported languages
- run code with custom input
- submit code for evaluation
- see submission history and statuses

### Contests Module

Students must be able to:

- browse contests
- open contest detail pages
- solve contest problems
- view contest state such as upcoming, ongoing, ended

### Leaderboards

Students must be able to:

- view global rankings
- view department leaderboard
- view department war standings

### Placement Hub

Students must be able to:

- browse companies
- open company detail pages
- view interview process
- browse coding questions by company
- browse aptitude questions by company
- browse interview preparation questions
- mark placement questions as solved
- bookmark placement questions
- view placement submissions
- take placement-oriented mock tests
- view placement leaderboard

### Shared Profile Experience

Students should also have access to:

- profile page
- settings page
- analytics page
- connections page

---

## 7.3 Teacher Experience

### Teacher Dashboard

The teacher dashboard should provide:

- total students in scope
- recent activity
- readiness signals
- department and year distributions
- quick links to assignments and analytics

### Student Oversight

Teachers should be able to:

- list students
- search/filter by department, year, or status
- inspect student performance
- assign problems

### Problem and Mock Test Support

Teachers should be able to:

- review problem inventory relevant to teaching
- manage mock tests
- use analytics for academic monitoring

### Teacher Communication

Teachers should be able to contact admins through the platform.

---

## 7.4 Admin Experience

### Admin Dashboard

The admin dashboard should provide:

- total users
- active users
- active students
- platform content counts
- department performance snapshot
- platform health insights

### User Management

Admins must be able to:

- create single users
- bulk create users
- update users
- block/unblock users
- delete users
- bulk delete users
- reset user passwords

### Content Management

Admins must be able to:

- create and edit core coding problems
- manage existing problem inventory
- manage contests
- manage mock tests
- manage placement companies
- manage placement question bank

### Admin Analytics and Auditing

Admins should be able to:

- fetch analytics
- fetch audit logs
- fetch platform summary

---

## 8. Placement Preparation Subsystem

This is one of the most important differentiators of the startup.

### Purpose

The placement subsystem turns generic coding practice into company-oriented preparation.

### Company Model

Each company should contain:

- name
- logo
- hiring type
- focus areas
- interview process stages
- description
- website

### Supported Hiring Types

- `Mass Hiring`
- `Product Based`

### Placement Question Types

- `coding`
- `aptitude`
- `interview`

### Placement User Actions

- browse companies
- browse questions by company
- browse topics by company
- open a specific question
- submit a placement solution
- toggle bookmark
- mark solved
- check own progress
- review submissions

### Current Placement Endpoints

- `GET /api/placement/companies`
- `GET /api/placement/companies/:name`
- `GET /api/placement/companies/:name/questions`
- `GET /api/placement/companies/:name/topics`
- `GET /api/placement/companies/:name/topic/:topic`
- `GET /api/placement/question/:id`
- `POST /api/placement/mark-solved`
- `POST /api/placement/toggle-bookmark`
- `GET /api/placement/progress/me`
- `POST /api/placement/submit-solution`
- `GET /api/placement/question/:id/submissions`

### Current Placement Admin Endpoints

- `POST /api/placement/admin/companies`
- `PATCH /api/placement/admin/companies/:name`
- `DELETE /api/placement/admin/companies/:name`
- `POST /api/placement/admin/questions`
- `PATCH /api/placement/admin/questions/:id`
- `DELETE /api/placement/admin/questions/:id`
- `GET /api/placement/admin/companies/:name/questions`

### Strategic Importance

If CampusArena is presented to colleges, this placement subsystem is a major reason to adopt it over a generic coding platform.

---

## 9. Coding Execution and Evaluation System

### Purpose

Students must be able to execute and submit code safely.

### Supported Languages

- Python
- C++
- Java

### Security Requirements

All code execution must happen in isolated Docker containers, not on the host machine.

### Current Execution Constraints

- no network access in container
- CPU limited
- memory limited
- timeout enforced
- isolated temporary file mounts only

### Current Runtime Configuration

- execution image: `campusarena-runner:latest`
- timeout default: `3000ms`
- memory default: `128m`
- CPU default: `0.5`

### Execution Endpoints

- `POST /api/run-code`
- `POST /api/submit`
- `POST /api/placement/submit-solution`

### Execution Outcomes

Submissions can result in:

- `Queued`
- `Accepted`
- `Wrong Answer`
- `Time Limit Exceeded`
- `Runtime Error`

### Architecture Expectations

- API receives code and metadata
- job is queued
- worker processes execution
- results are persisted
- socket events refresh leaderboard-related experiences where needed

---

## 10. Practice Session and Malpractice Tracking

This repo includes a `PracticeSession` model, which suggests supervised or monitored practice sessions.

### Session States

- `ACTIVE`
- `TERMINATED`
- `SUBMITTED`

### Recorded Safety Fields

- warning count
- malpractice flag
- termination reason
- violation history

### Recommended Product Interpretation

Use this subsystem for:

- controlled lab sessions
- monitored coding rounds
- faculty-supervised practice

Even if the UI is not fully complete, this data model should remain part of the product direction.

---

## 11. Data Model Specification

This section describes the core persistent entities already represented in the codebase.

## 11.1 User

Important fields:

- `userCode`
- `name`
- `email`
- `registrationNumber`
- `password`
- `role`
- `permissions`
- `department`
- `year`
- `isBlocked`
- `followers`
- `following`
- `profile.goal`
- `profile.activity`
- `profile.bio`
- `profile.ingredients`
- `profile.skills`
- `profile.socialLinks`

Key behaviors:

- password hashing with bcrypt
- auto-generated 6-digit `userCode`

## 11.2 Problem

Important fields:

- `problemCode`
- `title`
- `slug`
- `description`
- `difficulty`
- `tags`
- `constraints`
- `inputFormat`
- `outputFormat`
- `examples`
- `visibleTestCases`
- `hiddenTestCases`
- `starterCode`
- `supportedLanguages`
- `timeLimitMs`
- `memoryLimitMb`
- `createdBy`
- `isDailyEligible`
- `editorial`

Key behaviors:

- text search index on title and tags
- 6-digit `problemCode`

## 11.3 Submission

Important fields:

- `userId`
- `problemId`
- `difficulty`
- `contestId`
- `code`
- `language`
- `status`
- `runtime`
- `memory`
- `score`
- `passedCount`
- `totalCount`
- `stdout`
- `stderr`
- `testResults`
- `isDailyChallenge`

## 11.4 Company

Important fields:

- `name`
- `logo`
- `type`
- `focusAreas`
- `interviewProcess`
- `description`
- `website`

## 11.5 Question

This is used for the placement subsystem.

Important fields:

- `companyName`
- `type`
- `category`
- `topic`
- `difficulty`
- `title`
- `description`
- `constraints`
- `examples`
- `solution`
- `tags`
- `hints`

## 11.6 MockTest

Important fields:

- `title`
- `durationMinutes`
- `company`
- `questions`
- `startsAt`
- `endsAt`

Question entries can be:

- `mcq`
- `coding`

## 11.7 PracticeSession

Important fields:

- `userId`
- `problemId`
- `status`
- `warningCount`
- `malpractice`
- `terminationReason`
- `violations`
- `startedAt`
- `endedAt`

---

## 12. Frontend Structure

### Frontend Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Monaco Editor
- Recharts
- Socket.IO client

### Current Route Map

Authentication:

- `/auth`

Student:

- `/dashboard`
- `/problems`
- `/problems/:slug`
- `/contest`
- `/contest/:id`
- `/leaderboard`
- `/department-war`
- `/placement`
- `/placement/hub`
- `/placement/company/:name`
- `/placement/company/:companyId`
- `/placement/question/:id`
- `/placement/mock-test`
- `/placement/mock-result`
- `/placement/leaderboard`

Shared:

- `/profile`
- `/profile/connections`
- `/profile/:id`
- `/profile/:id/connections`

Teacher:

- `/teacher`
- `/teacher/users`
- `/teacher/departments`
- `/teacher/problems`
- `/teacher/mock-tests`
- `/teacher/analytics`
- `/teacher/settings`
- `/teacher/contact-admin`

Admin:

- `/admin`
- `/admin/users`
- `/admin/users/new`
- `/admin/problems`
- `/admin/problems/existing`
- `/admin/contests`
- `/admin/mock-tests`
- `/admin/departments`
- `/admin/analytics`
- `/admin/settings`
- `/admin/placement/companies`
- `/admin/placement/questions`

### Frontend Architecture Expectations

- route guards enforce authentication and roles
- shared shell layout wraps authenticated pages
- pages use reusable UI components
- theme support should remain consistent
- code editor experience should be central to problem solving pages

---

## 13. Backend Structure

### Backend Stack

- Node.js
- Express
- MongoDB with Mongoose
- Redis
- BullMQ
- Socket.IO
- JWT
- Docker runner integration

### Core Middleware

- CORS
- Helmet
- JSON body parsing
- Cookie parser
- request logging with Morgan
- rate limiting
- centralized error handling

### Health Endpoint

- `GET /health`

### API Base Path

- `/api`

### Backend Responsibilities

- authentication
- authorization
- input validation
- persistence
- queueing execution jobs
- serving dashboards and analytics
- serving placement content
- emitting socket events

---

## 14. Infrastructure and Deployment

### Current Local Infra

`docker-compose.yml` currently defines:

- MongoDB
- Redis
- runner image for secure code execution

### Environment Variables

The server currently expects:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`
- `REDIS_URL`
- `EXECUTION_IMAGE`
- `EXECUTION_TIMEOUT_MS`
- `EXECUTION_MEMORY`
- `EXECUTION_CPUS`

### Default Development Ports

- frontend: `5173`
- backend: `5000`
- MongoDB: `27017`
- Redis: `6379`

### Production Requirements

- managed MongoDB or self-hosted Mongo replica deployment
- managed Redis or self-hosted Redis
- Docker-capable execution environment
- HTTPS
- secret management
- centralized logging
- backup strategy for user/content data

---

## 15. Realtime Features

Socket-based updates are part of the architecture.

### Expected Realtime Uses

- leaderboard refresh
- contest or submission status refresh
- future notifications

### Requirement

Realtime must enhance the user experience but the system should still work if sockets reconnect or temporarily fail.

---

## 16. Analytics Requirements

Analytics are important for all three roles.

### Student Analytics

- solved problems trend
- language usage
- difficulty distribution
- streak or consistency signals

### Teacher Analytics

- class or department performance
- active vs inactive students
- assignment completion tracking

### Admin Analytics

- total users
- active users
- content inventory
- departmental performance
- adoption metrics

---

## 17. UX and Product Standards

### UX Requirements

- responsive layout on desktop, tablet, and mobile
- role-appropriate navigation
- loading states
- empty states
- validation messages
- secure and predictable code editor flows

### Visual Requirements

- maintain a professional academic-tech look
- keep clear difficulty/status color coding
- preserve readable dark/light theme support if used

### Accessibility Requirements

- keyboard-usable forms and navigation
- adequate contrast
- visible focus states
- no critical action hidden only behind hover

---

## 18. Known Product Realities and Important Notes

These points matter if an AI agent continues building from this repository.

### Important Reality 1

This is already a partially built product, not a blank startup concept.

An AI should extend and stabilize it rather than rebuild from scratch unless explicitly requested.

### Important Reality 2

There are overlapping placement-related frontend routes:

- `/placement/company/:name`
- `/placement/company/:companyId`

Any future refactor should unify the route strategy to avoid ambiguity.

### Important Reality 3

Older markdown files in the repo are useful but partly aspirational. This file should be treated as the implementation contract moving forward.

### Important Reality 4

The secure execution system is a core feature, not an optional enhancement.

### Important Reality 5

The product is positioned around the college ecosystem and should preserve institution-specific workflows such as college email onboarding, department competition, and teacher oversight.

---

## 19. Recommended Build Priorities for Any AI Agent

If an AI is asked to continue the project, it should follow this order unless the user says otherwise.

### Phase 1: Stabilize Core Flows

- authentication
- role-based navigation
- problems listing and workspace
- code execution
- submission persistence

### Phase 2: Strengthen Student Value

- dashboard quality
- leaderboards
- daily challenge
- contest flow

### Phase 3: Make Placement Hub Excellent

- company detail quality
- topic filters
- bookmarks
- progress tracking
- placement submissions
- placement leaderboard

### Phase 4: Strengthen Teacher and Admin Workflows

- bulk user management
- audit logs
- mock test management
- assignment workflows
- analytics clarity

### Phase 5: Production Hardening

- better error handling
- better tests
- edge-case validation
- performance tuning
- deployment documentation

---

## 20. Acceptance Criteria for the Product

An implementation should be considered successful when:

- a user can register or be created by admin
- a user can log in and land on the correct dashboard for their role
- a student can browse problems and solve them in the editor
- code execution works safely inside Docker
- submissions are evaluated and saved
- leaderboards load meaningful data
- placement companies and questions can be managed and consumed
- mock tests can be created and taken
- teachers can monitor students
- admins can manage users and content

---

## 21. Recommended Future Enhancements

These are valuable but not required for MVP completion:

- resume review
- AI-driven study recommendations
- discussion threads per problem
- editorial videos
- email or WhatsApp notifications
- recruiter-facing reporting
- interview scheduling workflows
- advanced proctoring

---

## 22. Final Instruction to Any AI Reading This

Do not treat CampusArena as only a coding platform.

It is a **campus operating system for coding readiness and placement preparation**.

When making product decisions:

- preserve role-based structure
- preserve secure execution
- preserve company-wise preparation
- preserve analytics and competitive motivation
- optimize for colleges, teachers, and students together

When in doubt:

- prefer workflows that help a college deploy this internally
- prefer implementation details that keep the product scalable and auditable
- prefer extending the current repository rather than replacing it

---

## 23. Repository Reference Snapshot

Important top-level directories:

- `client/` for frontend
- `server/` for backend
- `docker/` for execution and container setup

Important current top-level documents:

- `README.md`
- `OVERVIEW.md`
- `PLACEMENT_HUB_DOCUMENTATION.md`

This file supersedes them as the main implementation brief.
