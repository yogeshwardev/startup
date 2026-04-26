# 🚀 Placement Preparation Hub - Technical Documentation

## Overview

The Placement Preparation Hub is a LeetCode-style platform designed specifically for company-wise preparation. It includes company-specific problem sets, mock tests, performance tracking, and competitive leaderboards.

## 📁 File Structure

```
client/src/
├── pages/student/
│   ├── PlacementHubPage.jsx              # Main hub with company grid
│   ├── PlacementCompanyDetailPage.jsx    # Company details with tabs
│   ├── MockTestPage.jsx                  # Full-screen mock test environment
│   ├── MockTestResultPage.jsx            # Results & performance dashboard
│   └── PlacementLeaderboardPage.jsx      # Rankings & leaderboard
│
└── components/placement/
    ├── CodingQuestionsTab.jsx            # Coding problems with filters
    ├── AptitudeQuestionsTab.jsx          # Aptitude questions
    └── InterviewProcessTab.jsx           # Interview rounds & process
```

## 📄 Pages & Components

### 1. **PlacementHubPage.jsx** - Main Entry Point

**Purpose**: Home page showing all companies available for preparation.

**Features**:
- Grid layout of 7 companies (TCS, Infosys, Wipro, Accenture, Amazon, Microsoft, Google)
- Hiring type badges (Mass/Product)
- Focus areas tags (DSA, Aptitude, Core CS, etc.)
- Question count and mock test availability
- Company filtering (All/Mass/Product)
- Statistics cards (Total companies, questions, mock tests)

**Component Structure**:
```jsx
<PlacementHubPage>
  - PageHeader
  - Filter buttons (all, mass, product)
  - Stats cards (3 columns)
  - Company grid (3 columns on desktop)
    - CompanyCard (reusable)
```

**Route**:
```jsx
<Route path="/placement/hub" element={<PlacementHubPage />} />
```

---

### 2. **PlacementCompanyDetailPage.jsx** - Company Details

**Purpose**: Detailed view of a specific company with interview process and questions.

**Features**:
- Company header with logo and description
- Tabbed interface (4 tabs)
- Interview round breakdown
- Preparation statistics

**Tabs**:

#### a) **Overview Tab** (Default)
- Interview rounds breakdown
- Stage-wise duration and focus areas
- Preparation statistics
- Mock test button

#### b) **Coding Questions Tab** (`CodingQuestionsTab.jsx`)
- 30 questions divided by difficulty:
  - Easy: 10 questions
  - Medium: 10 questions
  - Hard: 10 questions
- Difficulty filters
- Question cards with:
  - Title and difficulty badge
  - Topic tags
  - Acceptance rate
  - Submission count
  - Bookmark toggle
  - Solve button

#### c) **Aptitude Tab** (`AptitudeQuestionsTab.jsx`)
- Company-specific aptitude questions
- Categories: Speed & Distance, Profit & Loss, Work & Time, Ratio, etc.
- Difficulty levels (Easy/Medium/Hard)
- Bookmark functionality
- Attempt button

#### d) **Interview Process Tab** (`InterviewProcessTab.jsx`)
- Visual timeline of interview stages
- Stage descriptions and duration
- Focus areas for each round
- Preparation guide
- Statistics cards

**Route**:
```jsx
<Route path="/placement/company/:companyId" element={<PlacementCompanyDetailPage />} />
```

---

### 3. **MockTestPage.jsx** - Full-Screen Mock Test

**Purpose**: Immersive coding test environment with timer and multiple questions.

**Features**:
- **Full-screen mode** (prevents navigation)
- **90-minute timer** with countdown
- **4 random questions** from database
- **Split layout**:
  - Left: Problem description with examples
  - Right: Code editor with output
  - Sidebar: Question list with status indicators

**Technical Details**:

**Layout Components**:
```jsx
<MockTestPage>
  - Header (timer, submit button)
  - Sidebar (question list)
  - Problem Description Panel
    - Title and difficulty badge
    - Problem statement
    - Examples (input/output)
    - Navigation buttons (prev/next)
  - Code Editor Panel
    - Language selector (Python/C++/Java)
    - CodeEditor component
    - Output display
    - Run and Submit buttons
```

**Functionality**:
- Language switching (Python, C++, Java)
- Run code with test inputs
- Submit solution (marks as solved)
- Timer countdown (blocks submission at 0)
- Question navigation with status indicators
- Disabled navigation during test

**Data Structure**:
```javascript
MOCK_TEST_QUESTIONS = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Array",
    description: "...",
    examples: [
      { input: "...", output: "..." },
      ...
    ]
  }
]
```

**Route**:
```jsx
<Route path="/placement/mock-test" element={<MockTestPage />} />
```

---

### 4. **MockTestResultPage.jsx** - Performance Dashboard

**Purpose**: Display results, analytics, and weak areas after test submission.

**Features**:

**Score Display**:
- Large percentage score
- Questions solved ratio
- Accuracy percentage
- Time taken
- Leaderboard rank

**Charts & Analytics**:
- **Bar Chart**: Performance by category (Correct vs Wrong)
- **Pie Chart**: Difficulty distribution (Easy/Medium/Hard)
- **Progress Bars**: Topic-wise accuracy with weak topic identification

**Data Displayed**:
- Weak topics (with accuracy %)
- Recommendations section
- Comparison with averages
- Previous best score
- Download and share options

**Layout**:
```jsx
<MockTestResultPage>
  - Back button
  - PageHeader
  - Score card (large, prominent)
  - Action buttons (Download, Share, Retake)
  - Charts (2-column grid)
  - Weak topics section
  - Recommendations alert box
  - Comparison stats (4-column grid)
```

**Route**:
```jsx
<Route path="/placement/mock-result" element={<MockTestResultPage />} />
```

---

### 5. **PlacementLeaderboardPage.jsx** - Rankings

**Purpose**: Company-specific rankings and competitive leaderboard.

**Features**:

**Top 3 Cards**:
- Gold, Silver, Bronze medals
- Rank, name, company
- Score, problems solved, streak

**Main Leaderboard Table**:
- Columns: Rank, Name, Company, Score, Solved, Streak
- Responsive design (mobile: cards, desktop: table)
- Company filtering (dropdown)
- Color-coded rank indicators
- Streak display with fire icon

**Statistics Section**:
- Total participants
- Average score
- User's rank
- User's score

**Features**:
- Sorting and filtering
- Rank badges/medals
- Emoji avatars
- Time range selection (all-time, this month, this week)

---

## 🎨 Styling & UI Details

### Color Scheme
```tailwind
Primary Brand: bg-brand-600 dark:bg-brand-500
Success (Easy): bg-emerald-500
Warning (Medium): bg-amber-500
Danger (Hard): bg-rose-500
Surface: app-surface (CSS variable)
```

### Responsive Design

**Mobile (default)**:
- Single column layouts
- Stacked cards
- Vertical scrolling
- Touch-friendly buttons

**Tablet (md: 768px)**:
- 2-column grids
- Adjusted spacing
- Optimized tab layout

**Desktop (lg: 1024px+)**:
- 3-column company grid
- 2-column chart layout
- Full table view
- Side panel for questions

### Components Used

```jsx
// Built-in Components
- PageHeader          // Page title & description
- Skeleton            // Loading states
- CodeEditor          // Syntax highlighting editor

// Lucide Icons
- Trophy, Medal, Flame
- Clock, AlertCircle, Download, Share2
- Play, Bookmark, BookmarkCheck, ArrowLeft
- BarChart, PieChart  // via Recharts

// Tailwind Utilities
- Grid/Flex layouts
- Dark mode (dark: prefix)
- Responsive classes (md:, lg:)
- Transitions & animations
```

---

## 🔗 Integration Guide

### 1. **Add Routes**

In your main router file:

```jsx
import PlacementHubPage from './pages/student/PlacementHubPage';
import PlacementCompanyDetailPage from './pages/student/PlacementCompanyDetailPage';
import MockTestPage from './pages/student/MockTestPage';
import MockTestResultPage from './pages/student/MockTestResultPage';
import PlacementLeaderboardPage from './pages/student/PlacementLeaderboardPage';

<Routes>
  <Route path="/placement/hub" element={<PlacementHubPage />} />
  <Route path="/placement/company/:companyId" element={<PlacementCompanyDetailPage />} />
  <Route path="/placement/mock-test" element={<MockTestPage />} />
  <Route path="/placement/mock-result" element={<MockTestResultPage />} />
  <Route path="/placement/leaderboard" element={<PlacementLeaderboardPage />} />
</Routes>
```

### 2. **Add Navigation Links**

```jsx
// In your navigation menu/sidebar
<Link to="/placement/hub">Placement Hub</Link>
<Link to="/placement/leaderboard">Leaderboard</Link>
```

### 3. **Install Dependencies** (if needed)

```bash
npm install recharts  # For charts in result page
```

---

## 📊 Data Flow

```
User Access
    ↓
PlacementHubPage (Browse companies)
    ↓
PlacementCompanyDetailPage (View company details)
    ├→ CodingQuestionsTab (Practice problems)
    ├→ AptitudeQuestionsTab (Aptitude questions)
    └→ InterviewProcessTab (Learn interview process)
    ↓
Click "Start Mock Test"
    ↓
MockTestPage (90-minute test)
    ↓
Submit Test
    ↓
MockTestResultPage (View results & analytics)
    ↓
PlacementLeaderboardPage (Check ranking)
```

---

## 🛠️ Customization

### Change Question Data

Edit the `QUESTIONS_DATA` object in `CodingQuestionsTab.jsx`:

```javascript
const QUESTIONS_DATA = {
  easy: [
    { id: 1, title: "...", topic: "...", acceptance: "...", submissions: "..." },
    // Add more questions
  ],
  medium: [...],
  hard: [...]
};
```

### Adjust Timer Duration

In `MockTestPage.jsx`:

```javascript
const [timeLeft, setTimeLeft] = useState(90 * 60); // Change 90 to desired minutes
```

### Modify Company List

In `PlacementHubPage.jsx`:

```javascript
const COMPANIES = [
  {
    id: 1,
    name: "Company Name",
    logo: "emoji",
    hiringType: "Mass/Product",
    focusAreas: ["DSA", "Aptitude"],
    questionsCount: 30,
    mockTests: 5,
  },
  // Add more companies
];
```

---

## 🚀 Future Enhancements

1. **API Integration**
   - Fetch questions from backend
   - Store test results in database
   - Real-time leaderboard updates

2. **Advanced Features**
   - Discussion forum for each question
   - Solution video tutorials
   - Company-wise hiring statistics
   - Resume evaluation

3. **Performance Tracking**
   - Detailed progress charts
   - Weak topic recommendations
   - Personalized study plans
   - Email notifications

4. **Social Features**
   - Share solutions with peers
   - Compete with friends
   - Mentorship connections
   - Study group formation

---

## 📱 Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## ⚡ Performance

- Lazy loading for questions
- Code editor optimization
- Chart rendering efficiency
- Image optimization
- CSS-in-JS minimization

---

## 🐛 Common Issues & Solutions

**Issue**: Timer not counting down
- **Solution**: Ensure `testStarted` state is `true`

**Issue**: Code editor not showing
- **Solution**: Check if CodeEditor component is imported correctly

**Issue**: Mock test not submitting
- **Solution**: Verify `handleSubmitTest` is properly navigating to result page

---

## 📝 Notes

- All pages support light/dark theme
- Responsive design works on all screen sizes
- No stacking issues in grid layouts
- Professional spacing and alignment
- Proper color contrast for accessibility

---

**Created**: April 26, 2026
**Framework**: React + Tailwind CSS + Recharts
**Status**: Production Ready
