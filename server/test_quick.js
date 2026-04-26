import axios from "axios";

const test = async () => {
  try {
    // Login
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

    // Get questions with all params
    console.log("🔍 Testing: GET /placement/companies/TCS/questions?type=coding&topic=Arrays&limit=100");
    try {
      const res = await api.get("/placement/companies/TCS/questions", {
        params: { type: "coding", topic: "Arrays", limit: 100 }
      });
      console.log("✅ SUCCESS!");
      console.log("Total questions:", res.data.pagination.total);
      console.log("Returned questions:", res.data.questions.length);
      if (res.data.questions.length > 0) {
        console.log("Sample question:", res.data.questions[0]);
      }
    } catch (error) {
      console.error("❌ ERROR:", error.response?.status);
      console.error("Response:", error.response?.data);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

test();
