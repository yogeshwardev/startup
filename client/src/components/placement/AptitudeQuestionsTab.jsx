import { useState } from "react";
import { Play, Bookmark, BookmarkCheck } from "lucide-react";

// Sample aptitude questions
const APTITUDE_QUESTIONS = [
  {
    id: 1,
    title: "If a train travels at 60 km/h for 2 hours and then at 80 km/h for 3 hours, what is the average speed?",
    category: "Speed & Distance",
    difficulty: "easy",
  },
  {
    id: 2,
    title: "A shopkeeper buys goods at 20% below the marked price and sells at the marked price. What is the profit percentage?",
    category: "Profit & Loss",
    difficulty: "easy",
  },
  {
    id: 3,
    title: "In a class of 40 students, 60% passed in English. How many students failed?",
    category: "Percentage",
    difficulty: "easy",
  },
  {
    id: 4,
    title: "If 5 men can complete a work in 12 days, in how many days can 8 men complete the same work?",
    category: "Work & Time",
    difficulty: "easy",
  },
  {
    id: 5,
    title: "The ratio of boys to girls in a class is 3:2. If there are 15 boys, how many girls are there?",
    category: "Ratio & Proportion",
    difficulty: "easy",
  },
];

const QuestionCard = ({ question, onSolve, onBookmark, isBookmarked }) => {
  const difficultyColor = {
    easy: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
    medium: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
    hard: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30",
  };

  return (
    <div className="app-muted rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 dark:text-white leading-tight mb-3">
            {question.title}
          </h4>

          <div className="flex flex-wrap gap-2">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${difficultyColor[question.difficulty]}`}>
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </span>
            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {question.category}
            </span>
          </div>
        </div>

        <button
          onClick={() => onBookmark(question.id)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition flex-shrink-0"
          title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          ) : (
            <Bookmark className="w-5 h-5 text-slate-400 dark:text-slate-600" />
          )}
        </button>
      </div>

      <button
        onClick={() => onSolve(question.id)}
        className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white text-sm font-medium transition"
      >
        <Play className="w-4 h-4" />
        Attempt
      </button>
    </div>
  );
};

const AptitudeQuestionsTab = ({ companyId }) => {
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
    alert(`Opening question ${questionId}`);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="app-surface rounded-xl border p-5">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Total Aptitude Questions</p>
        <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">{APTITUDE_QUESTIONS.length}</p>
      </div>

      {/* Questions Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {APTITUDE_QUESTIONS.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onSolve={handleSolve}
            onBookmark={handleBookmark}
            isBookmarked={bookmarked.has(question.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default AptitudeQuestionsTab;
