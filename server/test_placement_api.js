import axios from "axios";

const testAPI = async () => {
  try {
    // Login to get token
    console.log("🔐 Logging in...");
    const loginRes = await axios.post("http://localhost:5000/api/login", {
      email: "student@example.com",
      password: "password",
    });
    
    const token = loginRes.data.token;
    console.log("✅ Login successful\n");

    const api = axios.create({
      baseURL: "http://localhost:5000/api",
      headers: { Authorization: `Bearer ${token}` },
    });

    // Test 1: Get all companies
    console.log("1️⃣  Testing: GET /placement/companies");
    const companiesRes = await api.get("/placement/companies");
    console.log(`Found ${companiesRes.data.companies.length} companies`);
    console.log("Companies:", companiesRes.data.companies.map(c => c.name));
    console.log();

    // Test 2: Get TCS company details
    console.log("2️⃣  Testing: GET /placement/companies/TCS");
    const tcsRes = await api.get("/placement/companies/TCS");
    console.log("TCS company:", tcsRes.data.name);
    console.log();

    // Test 3: Get topics for TCS coding
    console.log("3️⃣  Testing: GET /placement/companies/TCS/topics?type=coding");
    const topicsRes = await api.get("/placement/companies/TCS/topics", {
      params: { type: "coding" }
    });
    console.log("Topics:", topicsRes.data.topics);
    console.log();

    // Test 4: Get ALL TCS coding questions (no topic filter)
    console.log("4️⃣  Testing: GET /placement/companies/TCS/questions?type=coding&limit=5");
    const allQuestionsRes = await api.get("/placement/companies/TCS/questions", {
      params: { type: "coding", limit: 5 }
    });
    console.log(`Total: ${allQuestionsRes.data.pagination.total} questions`);
    console.log("Sample questions:");
    allQuestionsRes.data.questions.forEach((q, i) => {
      console.log(`  ${i+1}. ${q.title} (topic: ${q.topic}, difficulty: ${q.difficulty})`);
    });
    console.log();

    // Test 5: Get Recursion questions
    console.log("5️⃣  Testing: GET /placement/companies/TCS/questions?type=coding&topic=Recursion");
    const recursionRes = await api.get("/placement/companies/TCS/questions", {
      params: { type: "coding", topic: "Recursion", limit: 100 }
    });
    console.log(`Total: ${recursionRes.data.pagination.total} Recursion questions`);
    if (recursionRes.data.questions.length > 0) {
      console.log("Sample Recursion questions:");
      recursionRes.data.questions.slice(0, 3).forEach((q, i) => {
        console.log(`  ${i+1}. ${q.title}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    process.exit(1);
  }
};

testAPI();
