import { executeCode } from './src/services/executionService.js';

const run = async () => {
  const code = `
#include <iostream>
#include <string>
using namespace std;
class Solution {
public:
    long long addThreeNumbers(long long a, long long b, long long c) {
        return a+b+c;
    }
};
int main() {
    char ch;
    long long a, b, c;
    if (!(cin >> ch)) return 0;
    cin >> a >> ch >> b >> ch >> c >> ch;
    Solution sol;
    cout << sol.addThreeNumbers((int)a, (int)b, (int)c) << endl;
    return 0;
}
`;
  const result = await executeCode({
    code,
    language: 'cpp',
    stdin: '[1, 2, 3]',
    timeLimitMs: 2000,
    memoryLimitMb: 256
  });
  console.log(result);
};
run().catch(console.error);
