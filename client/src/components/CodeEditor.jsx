import Editor from "@monaco-editor/react";

const defaultTemplates = {
  python: "n = int(input())\nnums = list(map(int, input().split()))\ntarget = int(input())\nlookup = {}\nfor index, value in enumerate(nums):\n    if target - value in lookup:\n        print(lookup[target - value], index)\n        break\n    lookup[value] = index\n",
  c: "#include <stdio.h>\n\nint main() {\n  int n, target;\n  scanf(\"%d\", &n);\n  int nums[1000];\n  for (int i = 0; i < n; i++) scanf(\"%d\", &nums[i]);\n  scanf(\"%d\", &target);\n  for (int i = 0; i < n; i++) {\n    for (int j = i + 1; j < n; j++) {\n      if (nums[i] + nums[j] == target) {\n        printf(\"%d %d\", i, j);\n        return 0;\n      }\n    }\n  }\n  return 0;\n}\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  int n, target;\n  cin >> n;\n  vector<int> nums(n);\n  for (int i = 0; i < n; i++) cin >> nums[i];\n  cin >> target;\n  unordered_map<int, int> seen;\n  for (int i = 0; i < n; i++) {\n    if (seen.count(target - nums[i])) {\n      cout << seen[target - nums[i]] << ' ' << i;\n      return 0;\n    }\n    seen[nums[i]] = i;\n  }\n}\n",
  java: "import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int n = sc.nextInt();\n    int[] nums = new int[n];\n    for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n    int target = sc.nextInt();\n    Map<Integer, Integer> seen = new HashMap<>();\n    for (int i = 0; i < n; i++) {\n      if (seen.containsKey(target - nums[i])) {\n        System.out.print(seen.get(target - nums[i]) + \" \" + i);\n        return;\n      }\n      seen.put(nums[i], i);\n    }\n  }\n}\n"
};

const CodeEditor = ({ language, value, onChange, options = {} }) => (
  <Editor
    height="100%"
    theme="vs-dark"
    language={language === "cpp" ? "cpp" : language}
    value={value || defaultTemplates[language]}
    onChange={(next) => onChange(next || "")}
    options={{
      minimap: { enabled: false },
      fontSize: 15,
      wordWrap: "on",
      padding: { top: 16 },
      smoothScrolling: true,
      ...options,
    }}
  />
);

export default CodeEditor;
