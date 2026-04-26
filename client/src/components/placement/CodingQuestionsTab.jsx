import { useState } from "react";
import { Play, Bookmark, BookmarkCheck } from "lucide-react";

// Sample coding questions
const QUESTIONS_DATA = {
  easy: [
    { id: 1, title: "Two Sum", topic: "Array", acceptance: "47.8%", submissions: "31.2M" },
    { id: 2, title: "Reverse String", topic: "String", acceptance: "82.1%", submissions: "2.1M" },
    { id: 3, title: "Valid Parentheses", topic: "Stack", acceptance: "42.3%", submissions: "8.9M" },
    { id: 4, title: "Merge Sorted Array", topic: "Array", acceptance: "47.2%", submissions: "2.3M" },
    { id: 5, title: "Binary Search", topic: "Binary Search", acceptance: "54.8%", submissions: "1.8M" },
    { id: 6, title: "Palindrome Number", topic: "Math", acceptance: "51.9%", submissions: "1.5M" },
    { id: 7, title: "Remove Duplicates", topic: "Array", acceptance: "53.1%", submissions: "1.2M" },
    { id: 8, title: "Linear Search", topic: "Search", acceptance: "68.5%", submissions: "900K" },
    { id: 9, title: "Count Characters", topic: "String", acceptance: "75.2%", submissions: "650K" },
    { id: 10, title: "Check Palindrome", topic: "String", acceptance: "62.1%", submissions: "780K" },
  ],
  medium: [
    { id: 11, title: "Longest Substring Without Repeating Characters", topic: "String", acceptance: "35.9%", submissions: "8.5M" },
    { id: 12, title: "Add Two Numbers", topic: "Linked List", acceptance: "34.2%", submissions: "4.2M" },
    { id: 13, title: "Longest Palindromic Substring", topic: "String", acceptance: "32.5%", submissions: "3.8M" },
    { id: 14, title: "Container With Most Water", topic: "Array", acceptance: "52.3%", submissions: "2.9M" },
    { id: 15, title: "3Sum", topic: "Array", acceptance: "33.8%", submissions: "3.2M" },
    { id: 16, title: "LRU Cache", topic: "Design", acceptance: "38.1%", submissions: "1.9M" },
    { id: 17, title: "Word Ladder", topic: "BFS", acceptance: "41.2%", submissions: "1.5M" },
    { id: 18, title: "Course Schedule", topic: "Graph", acceptance: "48.9%", submissions: "1.8M" },
    { id: 19, title: "Coin Change", topic: "DP", acceptance: "42.3%", submissions: "2.1M" },
    { id: 20, title: "Rotate Image", topic: "Array", acceptance: "59.8%", submissions: "1.2M" },
  ],
  hard: [
    { id: 21, title: "Median of Two Sorted Arrays", topic: "Array", acceptance: "29.7%", submissions: "2.1M" },
    { id: 22, title: "Regular Expression Matching", topic: "DP", acceptance: "28.3%", submissions: "1.2M" },
    { id: 23, title: "Merge k Sorted Lists", topic: "Linked List", acceptance: "47.1%", submissions: "1.5M" },
    { id: 24, title: "Trapping Rain Water", topic: "Array", acceptance: "50.5%", submissions: "1.8M" },
    { id: 25, title: "Word Ladder II", topic: "BFS", acceptance: "27.8%", submissions: "850K" },
    { id: 26, title: "Max Points on a Line", topic: "Geometry", acceptance: "18.5%", submissions: "520K" },
    { id: 27, title: "Edit Distance", topic: "DP", acceptance: "51.2%", submissions: "1.3M" },
    { id: 28, title: "Largest Rectangle in Histogram", topic: "Array", acceptance: "38.9%", submissions: "1.1M" },
    { id: 29, title: "Wildcard Matching", topic: "DP", acceptance: "27.3%", submissions: "680K" },
    { id: 30, title: "Burst Balloons", topic: "DP", acceptance: "48.1%", submissions: "450K" },
  ],
};

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "easy":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30";
    case "medium":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30";
    case "hard":
      return "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30";
    default:
      return "";
  }
};

const QuestionCard = ({ question, difficulty, onSolve, onBookmark, isBookmarked }) => {
  return (
    <div className="app-muted rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 dark:text-white truncate hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer">
            {question.title}
          </h4>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(difficulty)}`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {question.topic}
            </span>
          </div>

          <div className="flex gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Acceptance: {question.acceptance}</span>
            <span>Submissions: {question.submissions}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onBookmark(question.id)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            ) : (
              <Bookmark className="w-5 h-5 text-slate-400 dark:text-slate-600" />
            )}
          </button>
        </div>
      </div>

      <button
        onClick={() => onSolve(question.id)}
        className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white text-sm font-medium transition"
      >
        <Play className="w-4 h-4" />
        Solve
      </button>
    </div>
  );
};

const CodingQuestionsTab = ({ companyId }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [bookmarked, setBookmarked] = useState(new Set());

  const handleBookmark = (questionId) => {
    const newBookmarked = new Set(bookmarked);
    if (newBookmarked.has(questionId)) {
      newBookmarked.delete(questionId);
    } else {
      newBookmarked.add(questionId);
    }
    setBookmarked(newBookmarked);
  };

  const handleSolve = (questionId) => {
    // Navigate to problem solver
    window.location.href = `/problems/${questionId}`;
  };

  const difficulties = ["all", "easy", "medium", "hard"];
  let questionsToShow = [];

  if (selectedDifficulty === "all") {
    questionsToShow = [
      ...QUESTIONS_DATA.easy,
      ...QUESTIONS_DATA.medium,
      ...QUESTIONS_DATA.hard,
    ];
  } else {
    questionsToShow = QUESTIONS_DATA[selectedDifficulty];
  }

  return (
    <div className="space-y-6">
      {/* Difficulty Filter */}
      <div className="flex gap-3 flex-wrap">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty}
            onClick={() => setSelectedDifficulty(difficulty)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              selectedDifficulty === difficulty
                ? "bg-brand-600 dark:bg-brand-500 text-white shadow-lg"
                : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {difficulty === "all" ? "All Questions" : `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} (10)`}
          </button>
        ))}
      </div>

      {/* Question Count Stats */}
      <div className="app-surface rounded-xl border p-5">
        <div className="grid grid-cols-3 gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Easy</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">10</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Medium</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">10</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Hard</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">10</p>
          </div>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {selectedDifficulty === "all" ? (
          <>
            {/* Easy Section */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                Easy Questions (10)
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {QUESTIONS_DATA.easy.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    difficulty="easy"
                    onSolve={handleSolve}
                    onBookmark={handleBookmark}
                    isBookmarked={bookmarked.has(question.id)}
                  />
                ))}
              </div>
            </div>

            {/* Medium Section */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                Medium Questions (10)
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {QUESTIONS_DATA.medium.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    difficulty="medium"
                    onSolve={handleSolve}
                    onBookmark={handleBookmark}
                    isBookmarked={bookmarked.has(question.id)}
                  />
                ))}
              </div>
            </div>

            {/* Hard Section */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                Hard Questions (10)
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {QUESTIONS_DATA.hard.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    difficulty="hard"
                    onSolve={handleSolve}
                    onBookmark={handleBookmark}
                    isBookmarked={bookmarked.has(question.id)}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          QUESTIONS_DATA[selectedDifficulty].map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              difficulty={selectedDifficulty}
              onSolve={handleSolve}
              onBookmark={handleBookmark}
              isBookmarked={bookmarked.has(question.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CodingQuestionsTab;
