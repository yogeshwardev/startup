import { executeCode } from './src/services/executionService.js';
import { LANGUAGE_CONFIG } from './src/constants/languages.js';

const run = async () => {
  const code = `
#include <iostream>
#include <string>
#include <sstream>
#include <algorithm>
using namespace std;
class Solution {
public:
    long long addThreeNumbers(long long a, long long b, long long c) {
        return a+b+c;
    }
};
int main() {
    string s; getline(cin, s);
    replace(s.begin(), s.end(), '[', ' ');
    replace(s.begin(), s.end(), ']', ' ');
    replace(s.begin(), s.end(), ',', ' ');
    stringstream ss(s);
    int a, b, c;
    ss >> a >> b >> c;
    Solution sol;
    cout << sol.addThreeNumbers(a, b, c) << endl;
    return 0;
}
`;
  console.log("Running...");
  const result = await executeCode({
    code,
    language: 'cpp',
    stdin: '1,2,8',
    timeLimitMs: 2000,
    memoryLimitMb: 256
  });
  console.log(result);
};

run().catch(console.error);
