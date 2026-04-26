import axios from "axios";

const testAPI = async () => {
  try {
    const testEmail = "student@example.edu";
    const testPassword = "password123";
    const testRegNum = "CS001";

    console.log("Step 1: Attempting to register a test user...");
    try {
      const registerRes = await axios.post("http://localhost:5000/api/register", {
        email: testEmail,
        password: testPassword,
        registrationNumber: testRegNum,
        department: "CSE",
        year: 2,
      });
      console.log("Registration successful!\n");
    } catch (err) {
      if (err.response?.status === 409) {
        console.log("User already exists (will use existing account)\n");
      } else {
        throw err;
      }
    }

    // Now login to get a token
    console.log("Step 2: Attempting to login...");
    const loginRes = await axios.post("http://localhost:5000/api/login", {
      email: testEmail,
      password: testPassword,
    });
    
    const token = loginRes.data.token;
    console.log("Login successful, got token:", token.substring(0, 20) + "...\n");

    // Create axios instance with auth header
    const api = axios.create({
      baseURL: "http://localhost:5000/api",
      headers: { Authorization: Bearer $token },
    });

    // Test 1: Get topics
    console.log("Step 3: Testing: GET /placement/companies/TCS/topics?type=coding");
    const topicsRes = await api.get("/placement/companies/TCS/topics", { params: { type: "coding" } });
    console.log("Topics:", topicsRes.data.topics, "\n");

    // Test 2: Get questions for Recursion + easy
    console.log("Step 4: Testing: GET /placement/companies/TCS/questions?type=coding&topic=Recursion&difficulty=easy");
    const questionsRes = await api.get("/placement/companies/TCS/questions", {
      params: { type: "coding", topic: "Recursion", difficulty: "easy" },
    });
    console.log(Found ${questionsRes.data.pagination.total} questions);
    console.log(Returned ${questionsRes.data.questions.length} questions on page 1);
    console.log("\nFirst 2 questions:");
    questionsRes.data.questions.slice(0, 2).forEach((q, i) => {
      console.log(  ${i + 1}. ${q.title});
    });
    console.log("\nPagination:", questionsRes.data.pagination);

    console.log("\n✅ All tests passed!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    process.exit(1);
  }
};

testAPI();
