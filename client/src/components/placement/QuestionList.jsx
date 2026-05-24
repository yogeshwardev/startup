import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Bookmark, BookmarkIcon } from "lucide-react";
import http from "../../api/http";
import Skeleton from "../Skeleton";

const QuestionList = ({ company, type }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [expandedTopics, setExpandedTopics] = useState({});
  const [bookmarked, setBookmarked] = useState(new Set());

  // Fetch topics first
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        console.log(`Fetching topics for ${company.name}, type: ${type}`);
        const { data } = await http.get(`/placement/companies/${company.name}/topics`, {
          params: { type },
        });
        console.log("Topics fetched:", data);
        const topicsList = data.topics || [];
        setTopics(topicsList);
        setSelectedTopic("all");
      } catch (error) {
        console.error("Failed to load topics:", error);
      }
    };

    if (company?.name && type) {
      fetchTopics();
    }
  }, [company?.name, type]);

  // Fetch questions when filters change
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const query = { type, limit: 100 };
        if (selectedTopic && selectedTopic !== "all") query.topic = selectedTopic;
        if (selectedDifficulty !== "all") query.difficulty = selectedDifficulty;

        console.log("Fetching questions with query:", query, "for company:", company.name);
        const { data } = await http.get(
          `/placement/companies/${company.name}/questions`,
          { params: query }
        );
        console.log("Questions response:", data);
        setQuestions(data.questions || []);
        
        // Auto-expand all topics when questions load
        if (data.questions && data.questions.length > 0) {
          const expandAll = {};
          data.questions.forEach(q => {
            expandAll[q.topic] = true;
          });
          setExpandedTopics(expandAll);
        }
      } catch (error) {
        console.error("Failed to load questions:", error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    if (company?.name && type && selectedTopic !== "") {
      fetchQuestions();
    }
  }, [company?.name, type, selectedTopic, selectedDifficulty]);

  const handleBookmarkToggle = async (questionId) => {
    try {
      await http.post("/placement/toggle-bookmark", { questionId });
      const newBookmarked = new Set(bookmarked);
      if (newBookmarked.has(questionId)) {
        newBookmarked.delete(questionId);
      } else {
        newBookmarked.add(questionId);
      }
      setBookmarked(newBookmarked);
    } catch (error) {
      console.error("Failed to bookmark question:", error);
    }
  };

  const difficultyColors = {
    easy: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
    medium: "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
    hard: "bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30",
  };

  const groupedByTopic = questions.reduce((acc, q) => {
    if (!acc[q.topic]) acc[q.topic] = [];
    acc[q.topic].push(q);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Topic</label>
          <select
            value={selectedTopic || ""}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500 transition"
          >
            <option value="all">All Topics</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Difficulty</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500 transition"
          >
            <option value="all">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 app-surface p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">No questions found for selected filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(groupedByTopic).map((topic) => (
            <div key={topic} className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Topic Header */}
              <button
                onClick={() =>
                  setExpandedTopics((prev) => ({
                    ...prev,
                    [topic]: !prev[topic],
                  }))
                }
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition px-4 py-3 flex items-center justify-between"
              >
                <span className="font-semibold text-slate-900 dark:text-white">{topic}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {groupedByTopic[topic].length} questions
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 transition text-slate-600 dark:text-slate-400 ${
                      expandedTopics[topic] ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Questions List */}
              {expandedTopics[topic] && (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {groupedByTopic[topic].map((question) => (
                    <div
                      key={question._id}
                      className="bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition px-4 py-4 flex items-start justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {question.title}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium ${
                              difficultyColors[question.difficulty]
                            }`}
                          >
                            {question.difficulty.charAt(0).toUpperCase() +
                              question.difficulty.slice(1)}
                          </span>
                          {question.tags?.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-block rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBookmarkToggle(question._id)}
                          className="rounded-lg p-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                          {bookmarked.has(question._id) ? (
                            <BookmarkIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                          ) : (
                            <Bookmark className="h-5 w-5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" />
                          )}
                        </button>
                        <button 
                          onClick={() => navigate(`/placement/question/${question._id}`)}
                          className="rounded-lg bg-brand-600 dark:bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:hover:bg-brand-600 transition">
                          Solve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {questions.length === 0 && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 app-surface p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">No questions found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionList;
