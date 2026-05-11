import { Eraser, FileCode2, Play, TerminalSquare } from "lucide-react";
import { useMemo, useState } from "react";
import http from "../../api/http";
import CodeEditor from "../../components/CodeEditor";

const languages = [
  {
    label: "C",
    value: "c",
    fileName: "main.c",
    starter:
      '#include <stdio.h>\n\nint main() {\n  // Write C code here\n  printf("Start small. Ship something.\\n");\n\n  return 0;\n}\n',
  },
  {
    label: "C++",
    value: "cpp",
    fileName: "main.cpp",
    starter:
      '#include <iostream>\n\nint main() {\n  // Write C++ code here\n  std::cout << "Start small. Ship something." << std::endl;\n\n  return 0;\n}\n',
  },
  {
    label: "Java",
    value: "java",
    fileName: "Main.java",
    starter:
      'public class Main {\n  public static void main(String[] args) {\n    // Write Java code here\n    System.out.println("Start small. Ship something.");\n  }\n}\n',
  },
  {
    label: "Python",
    value: "python",
    fileName: "main.py",
    starter:
      '# Write Python code here\nprint("Start small. Ship something.")\n',
  },
  {
    label: "JavaScript",
    value: "javascript",
    fileName: "main.js",
    starter:
      '// Write JavaScript code here\nconsole.log("Start small. Ship something.");\n',
  },
];

const initialCodeMap = languages.reduce((acc, language) => {
  acc[language.value] = language.starter;
  return acc;
}, {});

const formatOutput = (result) => {
  if (!result) return "Run your code to see output here.";
  if (result.stderr) return result.stderr;
  if (result.stdout) return result.stdout;
  return "Program finished with no output.";
};

const CompilerPage = () => {
  const [language, setLanguage] = useState("cpp");
  const [codeMap, setCodeMap] = useState(initialCodeMap);
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  const currentLanguage = useMemo(
    () => languages.find((item) => item.value === language) || languages[1],
    [language]
  );

  const currentCode = codeMap[language] || currentLanguage.starter;

  const handleRun = async () => {
    setRunning(true);
    setResult({ stdout: "", stderr: "Running..." });

    try {
      const { data } = await http.post("/run-code", {
        code: currentCode,
        language,
        stdin,
      });
      setResult(data);
    } catch (error) {
      setResult({
        stdout: "",
        stderr: error.response?.data?.message || "Unable to run code.",
      });
    } finally {
      setRunning(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setStdin("");
  };

  return (
    <div className="compiler-page -m-5 lg:-m-7 flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-[#171b25] text-[var(--text-primary)]">
      <div className="flex h-[62px] shrink-0 items-center justify-between border-b border-[#3a3f4b] bg-[#2a2d34]">
        <div className="flex h-full min-w-0 items-center">
          <div className="flex h-full w-[168px] items-center gap-3 border-r border-[#3a3f4b] bg-[#202530] px-5">
            <FileCode2 className="h-5 w-5 text-brand-400" />
            <span className="truncate text-lg font-extrabold">{currentLanguage.fileName}</span>
          </div>

          <div className="hidden items-center gap-2 px-4 md:flex">
            {languages.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`rounded-md border px-3 py-1.5 text-sm font-bold transition ${
                  language === item.value
                    ? "border-brand-500 bg-brand-600 text-white"
                    : "border-[#4a4f5b] bg-[#242832] text-[#c4cad6] hover:border-[#626978] hover:bg-[#2d323d]"
                }`}
                onClick={() => setLanguage(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-full items-center gap-3 border-l border-[#3a3f4b] px-4">
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="input-field h-10 rounded-md px-3 text-sm font-bold md:hidden"
          >
            {languages.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-extrabold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play className="h-4 w-4 fill-current" />
            {running ? "Running" : "Run"}
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_0.9fr]">
        <section className="min-h-[48vh] border-b border-[#3a3f4b] bg-[#171b25] lg:min-h-0 lg:border-b-0 lg:border-r">
          <CodeEditor
            language={language}
            value={currentCode}
            onChange={(nextCode) =>
              setCodeMap((current) => ({ ...current, [language]: nextCode }))
            }
            options={{
              fontSize: 17,
              lineHeight: 28,
              padding: { top: 18 },
              scrollBeyondLastLine: false,
            }}
          />
        </section>

        <aside className="grid min-h-0 grid-rows-[auto_minmax(150px,0.42fr)_auto_minmax(180px,1fr)] bg-[#171b25]">
          <div className="flex h-[54px] items-center justify-between border-b border-[#3a3f4b] bg-[#2a2d34] px-6">
            <div className="flex items-center gap-2">
              <TerminalSquare className="h-5 w-5 text-brand-400" />
              <h2 className="text-lg font-extrabold">Input</h2>
            </div>
          </div>

          <textarea
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
            spellCheck="false"
            placeholder="Enter stdin here. Example: numbers, strings, test cases..."
            className="min-h-0 w-full resize-none border-b border-[#3a3f4b] bg-[#171b25] px-6 py-5 font-mono text-sm leading-6 text-[#e5e7eb] outline-none placeholder:text-[#6f7687] focus:bg-[#191e29]"
          />

          <div className="flex h-[54px] items-center justify-between border-b border-[#3a3f4b] bg-[#2a2d34] px-6">
            <div className="flex items-center gap-2">
              <TerminalSquare className="h-5 w-5 text-brand-400" />
              <h2 className="text-lg font-extrabold">Output</h2>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#6b7280] px-4 text-sm font-bold text-white transition hover:border-[#9ca3af] hover:bg-white/5"
            >
              <Eraser className="h-4 w-4" />
              Clear
            </button>
          </div>

          <pre
            className={`min-h-0 overflow-auto whitespace-pre-wrap break-words px-6 py-5 font-mono text-sm leading-6 ${
              result?.stderr && result.stderr !== "Running..."
                ? "text-rose-300"
                : "text-[#d6dae3]"
            }`}
          >
            {formatOutput(result)}
          </pre>
        </aside>
      </div>
    </div>
  );
};

export default CompilerPage;
