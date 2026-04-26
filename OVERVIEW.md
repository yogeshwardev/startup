# Competitive Coding Platform - Complete Feature Overview

## 📋 Table of Contents
1. [Platform Overview](#platform-overview)
2. [Authentication & Core Features](#authentication--core-features)
3. [Student Module](#student-module)
4. [Teacher Module](#teacher-module)
5. [Admin Module](#admin-module)
6. [Shared Features](#shared-features)
7. [Design & Technology Stack](#design--technology-stack)

---

## 🎯 Platform Overview

**Purpose**: A comprehensive competitive coding platform designed for campuses to teach, practice, and compete in coding challenges while preparing students for placements.

**Target Users**:
- **Students**: Practice coding, solve problems, compete in contests
- **Teachers**: Monitor student progress, manage problem sets
- **Admins**: Oversee platform operations, manage users and content

**Key Features Across All Roles**:
- ✅ Light/Dark theme support with CSS variables
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Real-time notifications and messaging
- ✅ User authentication and role-based access control
- ✅ Progress tracking and analytics

---

## 🔐 Authentication & Core Features

### **AuthPage.jsx**
**Location**: `client/src/pages/AuthPage.jsx`

**Features**:
- User login functionality
- Role-based authentication (Student, Teacher, Admin)
- Token-based session management
- Protected route system for authenticated users
- Password reset capability (if implemented)

**Design**:
- Clean, minimalist authentication form
- Light/dark theme support
- Error message handling
- Loading states during authentication

---

## 👨‍🎓 Student Module

### **1. StudentDashboard.jsx**
**Path**: `client/src/pages/student/StudentDashboard.jsx`

**Purpose**: Central hub for student's competitive coding journey

**Key Metrics Displayed**:
- Problems solved (all-time and current streak)
- Current contest standings
- Global leaderboard position
- Department war ranking
- Upcoming problems
- Daily challenge progress

**Features**:
- Daily challenge section with "Solve Now" action button
- Quick links to problem categories
- Contest overview with status indicators
- Leaderboard rankings (Global & Department)
- Department war competition tracker
- Practice statistics and progress overview
- Skeleton loading states for better UX

**Connected APIs**:
- `/dashboard` - Main dashboard statistics
- `/leaderboards` - Global leaderboard data
- `/department-war` - Department competition data

---

### **2. ProblemsPage.jsx**
**Path**: `client/src/pages/student/ProblemsPage.jsx`

**Purpose**: Browse and filter all available practice problems

**Key Features**:
- Problem list with detailed information
- **Difficulty filtering**: Easy, Medium, Hard
- Problem cards showing:
  - Problem title
  - Difficulty level with color-coded badges:
    - 🟢 Easy (Emerald)
    - 🟡 Medium (Amber)
    - 🔴 Hard (Rose)
  - Problem description preview
  - Acceptance rate
  - Number of submissions
  - Topic/category tags
- Search and sort functionality
- Pagination for large datasets
- Empty state handling
- Loading skeleton states

**Navigation**:
- Click on problem card → Navigate to `ProblemWorkspacePage`
- View solution → Code editor with I/O testing

**Design Pattern**:
- Grid-based responsive layout
- Light/dark theme with proper contrast
- Smooth transitions and hover effects

---

### **3. ProblemWorkspacePage.jsx**
**Path**: `client/src/pages/student/ProblemWorkspacePage.jsx`

**Purpose**: Code editor environment for solving practice problems

**Layout** (Responsive Grid):
- **Left Panel** (1 column on mobile, 1 on desktop):
  - Problem description
  - Constraints list
  - Examples with expandable sections
  - Tabs: Description, Submissions
  - Example input/output with explanation

- **Right Panel** (1 column on mobile, 2 on desktop):
  - Code editor (multiple language support)
  - Input/output testing section
  - Action buttons

**Key Features**:
- **Multi-language support**: Python, C++, Java
- **Code Editor**:
  - Syntax highlighting via CodeEditor component
  - Copy code button
  - Language selector dropdown
  
- **Code Execution**:
  - **Run Button**: Execute code with custom input
  - **Submit Button**: Submit solution for evaluation
  - Real-time output display with color-coded results:
    - 🟢 Success output (green)
    - 🔴 Error messages (red)
    - ⚪ No output yet (gray)

- **Input/Output Testing**:
  - Custom input textarea
  - Output display with line wrapping
  - Error message handling
  - Example-based testing

- **Submissions Tab**:
  - Shows all previous submissions
  - Submission metadata (language, timestamp)
  - Success/failure status indicator

- **User Experience**:
  - Smooth loading states with skeleton
  - Error handling with back button
  - Auto-load problem details from URL slug
  - Proper dark/light theme styling throughout

**Connected APIs**:
- `/placement/question/{id}` - Problem details
- `/run-code` - Code execution
- `/placement/submit-solution` - Solution submission
- `/placement/question/{id}/submissions` - User submissions

---

### **4. ContestListPage.jsx**
**Path**: `client/src/pages/student/ContestListPage.jsx`

**Purpose**: Browse and join coding competitions

**Contest Card Information**:
- Contest title
- Start and end time
- Problem count
- Time remaining (countdown timer)
- Contest status indicator
- Join button

**Features**:
- Real-time contest timer (Upcoming, Ongoing, Ended)
- Contest countdown in human-readable format
- Problem count display
- Quick navigation to contest details
- Sorting by status (Upcoming → Ongoing → Ended)
- Empty state when no contests available

**Connected APIs**:
- `/contests` - List all contests

---

### **5. ContestDetailPage.jsx**
**Path**: `client/src/pages/student/ContestDetailPage.jsx`

**Purpose**: View contest details and participate in competitions

**Features**:
- Contest metadata (title, description, duration)
- Problem list within contest
- Real-time countdown timer
- Submission history
- Contest standings/leaderboard (if applicable)
- Status indicators (Not started, In progress, Finished)

**Problem Interaction**:
- View problem statement
- Submit solutions
- Track submission status
- View problem-specific leaderboard

---

### **6. LeaderboardPage.jsx**
**Path**: `client/src/pages/student/LeaderboardPage.jsx`

**Purpose**: View global and department-wide rankings

**Features**:
- Global leaderboard with top performers
- Department-specific leaderboards
- Ranking metrics:
  - Problems solved count
  - Submission success rate
  - Points/score
  - User profile link
- Pagination for large leaderboards
- Current user position highlight
- User avatar/profile images
- Time-period filtering (All-time, This month, This week)

---

### **7. DepartmentWarPage.jsx**
**Path**: `client/src/pages/student/DepartmentWarPage.jsx`

**Purpose**: Inter-department competitive coding competition

**Features**:
- Department rankings
- Total problems solved per department
- Comparative statistics
- Department-wise performance metrics
- Member list per department
- Live update of department standings
- Visual representation (charts/graphs)

**Gamification Elements**:
- Department points system
- Team-based competition
- Real-time standings update

---

### **8. EditorPage.jsx**
**Path**: `client/src/pages/student/EditorPage.jsx`

**Purpose**: Quick code testing environment without problem context

**Features**:
- Standalone code editor
- Multi-language support
- Run code with custom input
- Output display
- No submission tracking

---

### **9. PlacementProblemWorkspacePage.jsx**
**Path**: `client/src/pages/student/PlacementProblemWorkspacePage.jsx`

**Purpose**: Dedicated placement practice problem solver

**Layout** (Responsive):
- **Left Panel** (Problem Description - 1 col):
  - Difficulty badge (Easy/Medium/Hard with colors)
  - Topic badge
  - Tabs: Description, Submissions
  - Problem statement
  - Constraints list
  - Examples (expandable):
    - Input/Output/Explanation
    - Code highlighting
  
- **Right Panel** (Code Editor - 2 cols):
  - Language selector (Python, C++, Java)
  - Copy code button
  - Syntax-highlighted code editor
  - Input/Output sections side-by-side
  - Run and Submit buttons
  - Submission results with status

**Features**:
- **Problem Metadata**:
  - Difficulty color-coding:
    - 🟢 Easy (Emerald)
    - 🟡 Medium (Amber)
    - 🔴 Hard (Rose)
  - Topic categorization
  - Company/Interview focus areas

- **Code Execution**:
  - Real-time code execution
  - Error handling and display
  - Output formatting
  - Input validation

- **Submissions**:
  - Success/failure feedback
  - Submission timestamp
  - Language used
  - Previous attempts tracking

- **Design**:
  - Full light/dark theme support
  - Responsive grid layout
  - Professional styling with proper borders
  - Smooth transitions and hover states

**Connected APIs**:
- `/placement/question/{id}` - Problem details
- `/run-code` - Code execution
- `/placement/submit-solution` - Solution submission
- `/placement/question/{id}/submissions` - User submissions

---

## 👨‍🏫 Teacher Module

### **1. TeacherDashboard.jsx**
**Path**: `client/src/pages/teacher/TeacherDashboard.jsx`

**Purpose**: Central overview of student readiness and progress

**Key Metrics**:
- Total students in scope
- Active students count
- Years/grades covered
- Recent student activity

**Features**:
- Student list with recent activity
- Performance overview
- Department distribution
- Problem statistics
- Active student indicators
- Quick links to manage students

**Design**:
- Faculty-first layout
- Quick action buttons
- Section cards with student info

---

### **2. TeacherProblemsPage.jsx**
**Path**: `client/src/pages/teacher/TeacherProblemsPage.jsx`

**Purpose**: Manage and assign practice problems to students

**Features**:
- View all problems in system
- Create/edit/delete problems
- Problem assignment to students/groups
- Set difficulty levels
- Define constraints and examples
- Topic categorization
- Batch operations (assign multiple problems)

**Problem Management Fields**:
- Title and description
- Difficulty level
- Constraints
- Test cases/examples
- Topic tags
- Expected solution approach

---

### **3. StudentsPage.jsx**
**Path**: `client/src/pages/teacher/StudentsPage.jsx`

**Purpose**: Manage and monitor student roster

**Features**:
- List all students
- Filter by year/department/status
- View student details
- Track progress metrics
- Block/unblock students
- Assign problems to students
- View submission history

**Student Information Displayed**:
- Name and student ID
- Department/year
- Problems solved count
- Current streak
- Last activity timestamp
- Status (Active/Blocked)

---

### **4. ContactAdminPage.jsx**
**Path**: `client/src/pages/teacher/ContactAdminPage.jsx`

**Purpose**: Communication channel with administrators

**Features**:
- Send messages/reports to admins
- Support ticket system
- Feedback submission
- Issue reporting
- Status tracking

---

## 🛠️ Admin Module

### **1. AdminDashboard.jsx**
**Path**: `client/src/pages/admin/AdminDashboard.jsx`

**Purpose**: Platform-wide operations overview and health metrics

**Key Analytics**:
- **Total Users**: All accounts across all roles
- **Active Users**: Users with submissions in last 7 days
- **Active Students**: Currently unblocked student accounts
- **Problem Inventory**: Total practice problems + daily sets

**Features**:
- Department distribution chart
- Performance metrics visualization
- User activity tracking
- Platform health indicators
- Quick navigation to management pages
- Statistical insights

**Visualizations**:
- Department-wise solved problems bar chart
- User growth trends
- Activity heatmaps
- Performance distribution graphs

---

### **2. UserManagementPage.jsx**
**Path**: `client/src/pages/admin/UserManagementPage.jsx`

**Purpose**: Create, update, and manage all user accounts

**Features**:
- List all users with filters
- Search by name/email/ID
- Filter by role (Student, Teacher, Admin)
- Filter by status (Active, Blocked)
- Block/unblock users
- Edit user details
- Delete user accounts
- Bulk user import
- Set user roles and permissions

**User Fields Managed**:
- Name, email, phone
- Roll number/ID
- Department, year/section
- Role assignment
- Account status
- Registration date

---

### **3. UserCreatePage.jsx**
**Path**: `client/src/pages/admin/UserCreatePage.jsx`

**Purpose**: Single or bulk user onboarding

**Features**:
- **Single User Creation**:
  - Manual entry form
  - Real-time validation
  - Role assignment
  - Department selection

- **Bulk Upload**:
  - CSV import functionality
  - Sample template download
  - Validation before import
  - Error reporting on failed imports
  - Success summary

**Form Fields**:
- Name, email, phone
- Roll/ID number
- Department
- Year/Section
- Role (Student, Teacher, Admin)
- Initial password generation

---

### **4. ProblemManagementPage.jsx**
**Path**: `client/src/pages/admin/ProblemManagementPage.jsx`

**Purpose**: Central problem repository management

**Features**:
- View all problems
- Create new problems
- Edit existing problems
- Delete problems
- Set difficulty levels
- Add test cases
- Define constraints
- Tag with topics
- Set expected complexity/approach
- View problem statistics (attempts, success rate)

**Problem Details**:
- Title, slug, description
- Difficulty (Easy/Medium/Hard)
- Constraints list
- Examples (Input/Output/Explanation)
- Test cases
- Time/space limits
- Languages supported
- Topics/categories
- Problem source attribution

---

### **5. ProblemManagementPage.jsx** (Alternative/Edit View)
**Path**: `client/src/pages/admin/ExistingProblemsPage.jsx`

**Purpose**: Manage existing problem inventory

**Features**:
- Filter problems by:
  - Difficulty
  - Topic
  - Last modified date
  - Creator
- Batch operations:
  - Delete multiple
  - Update difficulty
  - Add to contests
- View problem statistics
- Problem performance metrics

---

### **6. QuestionManagementPage.jsx**
**Path**: `client/src/pages/admin/QuestionManagementPage.jsx`

**Purpose**: Manage interview and aptitude questions

**Features**:
- Create interview questions
- Create aptitude questions
- Define question categories
- Set difficulty levels
- Manage expected answers
- Question usage tracking
- Performance analytics

**Question Types**:
- Multiple choice
- Short answer
- Essay type
- Code-based questions

---

### **7. ContestManagementPage.jsx**
**Path**: `client/src/pages/admin/ContestManagementPage.jsx`

**Purpose**: Create and manage coding contests

**Features**:
- Create new contests
- Set contest duration
- Add problems to contests
- Set scoring rules
- Enable/disable contests
- View contest standings
- Monitor submissions
- Edit contest details

**Contest Configuration**:
- Title and description
- Start/end time
- Problem set selection
- Scoring rules
- Leaderboard visibility
- Problem visibility during contest
- Registration open/close

---

### **8. CompanyManagementPage.jsx**
**Path**: `client/src/pages/admin/CompanyManagementPage.jsx`

**Purpose**: Manage placement companies and opportunities

**Features**:
- Add company details
- Define hiring types:
  - Mass Hiring (high volume)
  - Targeted Hiring (specific profiles)
- Set focus areas (tech stack)
- Interview process definition
- Problem set assignment
- Track company engagement
- Manage company profiles

**Company Information**:
- Company name and logo
- Hiring type
- Focus areas (Java, Python, DSA, etc.)
- Interview rounds info
- Problem categories
- Salary/package info
- Contact person details

---

## 🌐 Shared Features

### **1. CompanyListPage.jsx**
**Path**: `client/src/pages/shared/CompanyListPage.jsx`

**Purpose**: Browse companies hiring from campus

**Features**:
- Grid layout of company cards
- Company filtering:
  - By hiring type (Mass Hiring, Targeted)
  - By focus area
- Company information cards showing:
  - Company name and logo
  - Hiring type badge (Mass/Targeted)
  - Focus areas (languages/skills)
  - Quick details
- Click to view company details
- Responsive design (mobile, tablet, desktop)

**Company Card Details**:
- Company name
- Logo/image
- Hiring type with color-coded badges:
  - Brand color for Mass Hiring
  - Other colors for different types
- Focus areas list
- Action button to view details

---

### **2. CompanyDetailPage.jsx**
**Path**: `client/src/pages/shared/CompanyDetailPage.jsx`

**Purpose**: Deep dive into company hiring process and questions

**Layout**:
- Company header with details
- Tabbed interface:
  - **Interview Process Tab**: Shows hiring rounds/process flow
  - **Questions Tab**: Problems specific to this company
  - **Aptitude Tab**: Company's aptitude questions (if any)

**Features**:
- **Interview Process Tab**:
  - Round-by-round breakdown
  - Round duration
  - Topics covered
  - Visual stage indicators
  
- **Questions Tab**:
  - Difficulty-filtered problems
  - Filter by focus area
  - Problem count by difficulty
  - Links to solve problems
  
- **Aptitude Questions Tab**:
  - Company-specific interview questions
  - Question type indicator
  - Attempt tracking

**Styling**:
- Light/dark theme support
- Responsive tabs
- Proper light/dark colors for all elements
- Border and spacing consistency

---

### **3. UserProfilePage.jsx**
**Path**: `client/src/pages/shared/UserProfilePage.jsx`

**Purpose**: View and edit personal profile

**Features**:
- Display user information:
  - Name, email, phone
  - Department, year
  - Role
  - Profile picture
- Edit profile fields:
  - Name, email, phone
  - Profile picture upload
  - Bio/about
  - Links (GitHub, LinkedIn)
- Statistics:
  - Problems solved
  - Contests participated
  - Current streak
  - Rating/level

---

### **4. SettingsPage.jsx**
**Path**: `client/src/pages/shared/SettingsPage.jsx`

**Purpose**: Configure user preferences and account settings

**Features**:
- **Theme Settings**:
  - Light/Dark mode toggle
  - Theme persistence
  
- **Notification Settings**:
  - Email notifications
  - Problem reminders
  - Contest alerts
  - Submission results
  
- **Privacy Settings**:
  - Profile visibility
  - Leaderboard opt-in/out
  
- **Account Settings**:
  - Password change
  - Session management
  - Account deletion option

---

### **5. AnalyticsPage.jsx**
**Path**: `client/src/pages/shared/AnalyticsPage.jsx`

**Purpose**: Personal analytics and progress dashboard

**Features**:
- Problem solving trends
- Language proficiency breakdown
- Difficulty distribution (attempted vs solved)
- Problem category performance
- Time-based analytics (daily, weekly, monthly)
- Streak tracking
- Rating progression
- Topic mastery levels

**Visualizations**:
- Line charts for trends
- Bar charts for distributions
- Heatmaps for activity
- Pie charts for category breakdown

---

### **6. DepartmentsPage.jsx**
**Path**: `client/src/pages/shared/DepartmentsPage.jsx`

**Purpose**: View department-wide statistics and information

**Features**:
- Department list
- Department statistics:
  - Total students
  - Active students
  - Problems solved (department total)
  - Average rating
  - Top performers
- Department-wise leaderboard
- Department war standings
- Filter options

---

### **7. ConnectionsPage.jsx**
**Path**: `client/src/pages/shared/ConnectionsPage.jsx`

**Purpose**: Network and connect with peers

**Features**:
- Friend list management
- Add/remove connections
- View mutual friends
- Connect with high performers
- Messaging with connections
- Activity feed of connections

---

## 🎨 Design & Technology Stack

### **Frontend Technologies**:
- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS with custom configuration
- **Icons**: Lucide React
- **Routing**: React Router v6
- **HTTP Client**: Custom axios-based HTTP client
- **State Management**: React Context API (Auth, Theme, Toast)
- **Code Editor**: Monaco Editor or CodeMirror integration
- **Charts/Analytics**: Chart.js or Recharts

### **Design System**:

**Color Palette**:
- **Primary (Brand)**: Indigo (#8b5cf6) - replaces previous blue
- **Accent**: Cyan (#06b6d4)
- **Status Colors**:
  - Success/Easy: Emerald (#059669)
  - Warning/Medium: Amber (#d97706)
  - Danger/Hard: Rose (#e11d48)
- **Neutral**: Slate scale (50-950)

**Typography**:
- Headings: Bold, large font weights
- Body: Regular, optimized for reading
- Mono: Fixed-width for code

**Components**:
- `PageHeader`: Title, description, action button
- `SectionCard`: Content container with styling
- `StatCard`: Key metrics display
- `Badge`: Status indicators
- `Modal`: Dialog overlays
- `CodeEditor`: Syntax highlighting editor
- `Skeleton`: Loading placeholders
- `EmptyState`: No data state display

**Responsive Breakpoints**:
- Mobile: Default
- Tablet: md (768px)
- Desktop: lg (1024px), xl (1280px)

**Theme Support**:
- CSS variable-based theme system
- Dark mode via `dark:` Tailwind classes
- Persistent theme selection
- System preference detection (optional)

---

## 📱 Responsive Design

### **Mobile (Default)**:
- Single column layout
- Full-width components
- Simplified navigation
- Touch-friendly button sizes
- Vertical problem workspace layout

### **Tablet (md: 768px)**:
- 2-column grids where applicable
- Horizontal tabs
- Condensed problem layout
- Side-by-side input/output

### **Desktop (lg: 1024px+)**:
- Multi-column layouts
- Full-featured interfaces
- Resizable panels (where applicable)
- Professional spacing

---

## 🔗 Key APIs Endpoint Summary

### **Authentication**:
- `POST /auth/login` - User login
- `POST /auth/logout` - Logout
- `POST /auth/register` - User registration

### **Dashboard**:
- `GET /dashboard` - Student dashboard data
- `GET /analytics` - Admin analytics
- `GET /users` - Teacher student list

### **Problems**:
- `GET /problems` - List all problems
- `GET /placement/question/{id}` - Problem details
- `POST /run-code` - Execute code
- `POST /placement/submit-solution` - Submit solution
- `GET /placement/question/{id}/submissions` - User submissions

### **Contests**:
- `GET /contests` - List contests
- `GET /contest/{id}` - Contest details
- `POST /contest/{id}/join` - Join contest

### **Leaderboards**:
- `GET /leaderboards` - Global leaderboard
- `GET /department-war` - Department standings

### **Placement**:
- `GET /placement/companies` - Company list
- `GET /placement/company/{id}` - Company details
- `GET /placement/interview-process` - Interview questions
- `GET /placement/aptitude-questions` - Aptitude questions

### **User Management**:
- `GET /users` - List users
- `POST /users` - Create user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user
- `POST /users/bulk` - Bulk user import

---

## 🎯 Key Features Summary Table

| Feature | Student | Teacher | Admin | Shared |
|---------|---------|---------|-------|--------|
| View Problems | ✅ | ✅ | ✅ | - |
| Submit Solutions | ✅ | - | - | - |
| Contests | ✅ | - | ✅ | - |
| Leaderboards | ✅ | ✅ | ✅ | - |
| Manage Problems | - | ✅ | ✅ | - |
| Manage Users | - | - | ✅ | - |
| View Profile | ✅ | ✅ | ✅ | ✅ |
| Analytics | ✅ | ✅ | ✅ | ✅ |
| Placement Companies | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ | ✅ |
| Dark Mode | ✅ | ✅ | ✅ | ✅ |

---

## 🚀 Getting Started

### **For Students**:
1. Login with student credentials
2. Go to Dashboard to see daily challenge
3. Browse Problems or Contests
4. Click on a problem to start coding
5. Use the code editor to write and test
6. Submit for evaluation

### **For Teachers**:
1. Login with teacher credentials
2. Navigate to Students page to view roster
3. Check Teacher Dashboard for insights
4. Manage problems for students

### **For Admins**:
1. Login with admin credentials
2. Access Admin Dashboard for platform overview
3. Manage users, problems, and contests
4. View platform analytics

---

## 📝 Notes

- All pages support **light/dark theme** with proper styling
- **Responsive design** works seamlessly across devices
- **Loading states** with skeleton screens for better UX
- **Error handling** with user-friendly messages
- **Empty states** for sections with no data
- Real-time features use polling/websockets (where applicable)
- Code execution uses a backend runner service
- All submissions are persisted and trackable

---

*Last Updated: April 26, 2026*
*Platform: Competitive Coding Education Platform*
