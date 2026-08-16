/**
 * Intelligent Mock Interview API Engine.
 * Supports adaptive questions by Interview Type, Domain, Difficulty, and Candidate Skills.
 * Computes live turn-by-turn evaluations, structured scoring, final reports, and weak-area practice drills.
 */
import type {
  InterviewRequest,
  InterviewResponse,
  InterviewType,
  DifficultyLevel,
  Candidate,
  AnswerEvaluation,
  WeakAreaPractice,
  ScoreBreakdown,
} from "./types";

type MockSession = {
  sessionId: string;
  turn: number;
  candidateName: string;
  domain: string;
  role: string;
  interviewType: InterviewType;
  difficulty: DifficultyLevel;
  skills: string[];
  answers: string[];
  questions: string[];
  evaluations: AnswerEvaluation[];
};

const sessions = new Map<string, MockSession>();

const DOMAIN_QUESTIONS: Record<string, Record<InterviewType, Record<DifficultyLevel, string[]>>> = {
  "AI/ML": {
    technical: {
      beginner: [
        "[Fundamentals] In your own words, what is the core difference between supervised learning and unsupervised learning, and how do embeddings represent semantic meaning?",
        "[Vector Search] Explain how cosine similarity is used to find relevant documents in a vector database like Pinecone or ChromaDB.",
        "[Prompting] What is the difference between zero-shot, one-shot, and few-shot prompting? Give an example where few-shot makes a critical difference.",
        "[RAG Basics] Walk through the basic components of a Retrieval-Augmented Generation (RAG) pipeline from document ingestion to generating a response.",
        "[Model Evaluation] How would you check if an LLM is hallucinating or generating inaccurate facts in a production system?",
      ],
      intermediate: [
        "[Day 3 · Embeddings] If two document embeddings have a high cosine similarity but the documents are semantically contradictory, what causes this and how would you diagnose it?",
        "[Day 8 · RAG Chunking] Walk me through how you would chunk a 200-page unstructured technical manual for a RAG pipeline. What chunk size, overlap, and metadata strategy would you pick, and why?",
        "[Day 14 · Context & Prompting] Suppose retrieval fetches the correct context chunk, but the model still answers incorrectly or ignores the context. How do you isolate whether the root issue is prompt formatting, attention dilution (lost in the middle), or model bias?",
        "[Day 19 · Agent Loops] What is the practical difference between a static sequential chain and an autonomous tool-calling loop (ReAct)? What failure mode worries you most when deploying agents to production?",
        "[Day 26 · Evaluation & Guardrails] How would you build an automated evaluation pipeline to measure retrieval Recall@k and response Faithfulness before deploying an updated prompt to users?",
      ],
      advanced: [
        "[Architecture & Scale] You are designing a multi-tenant enterprise RAG system querying 10 million financial records with sub-200ms p95 latency. Walk me through your hybrid search (BM25 + dense), re-ranking, and caching architecture.",
        "[Agentic Workflows & MCP] How would you architect a distributed multi-agent system where worker agents can execute arbitrary tools while enforcing strict token budgets, loop bounding, and sandbox isolation?",
        "[Fine-Tuning vs. Alignment] When would you choose Parameter-Efficient Fine-Tuning (LoRA/QLoRA) over continuous in-context learning with long context windows, and how do you evaluate catastrophic forgetting?",
        "[Production Resilience] How do you handle non-deterministic failure modes and rate limit thundering herds when orchestrating parallel LLM calls across multiple frontier model providers?",
        "[Security & Guardrails] Describe your defense-in-depth strategy against indirect prompt injection, tool hijacking, and sensitive data exfiltration in agentic applications.",
      ],
    },
    behavioral: {
      beginner: [
        "[Collaboration] Tell me about a time you had to explain a complex AI or machine learning concept to a non-technical teammate or stakeholder.",
        "[Problem Solving] Describe a situation where a model or project you were working on didn't produce the expected results. How did you debug and adapt?",
        "[Learning] AI is evolving rapidly. How do you keep your skills up to date and decide which new papers, models, or libraries are worth adopting?",
        "[Teamwork] Tell me about a time you received critical feedback on your code or analytical approach. How did you handle it?",
        "[Prioritization] How do you prioritize tasks when you have multiple deliverables with competing deadlines?",
      ],
      intermediate: [
        "[Stakeholder Management] Describe a time when a product manager or business leader wanted to deploy an AI feature that you felt was not ready or reliable. How did you manage expectations?",
        "[Conflict & Trade-offs] Tell me about a disagreement you had with an engineering colleague regarding an architectural choice or model selection. How did you resolve it?",
        "[Project Delivery] Walk me through a challenging AI/ML project where you faced tight deadlines or unexpected constraints. What trade-offs did you make to ship on time?",
        "[Mentorship] Tell me about an experience mentoring a junior colleague or onboarded engineer in AI best practices.",
        "[Failure Analysis] Share an example of a technical initiative or experiment that failed. What post-mortem did you conduct and what lessons did you apply to future systems?",
      ],
      advanced: [
        "[Strategic Leadership] Tell me about a time you defined the AI technology roadmap for a major product initiative. How did you balance cutting-edge innovation against cost and reliability?",
        "[Executive Influence] Describe a situation where you had to persuade executive leadership to invest in foundational AI infrastructure or technical debt refactoring.",
        "[High-Stakes Crisis] Walk me through an incident where an AI system experienced a high-severity production outage, hallucination event, or compliance concern. How did you lead the response?",
        "[Team Culture] How do you foster an engineering culture of rigorous testing, ethical AI considerations, and continuous experimentation across multiple teams?",
        "[Cross-Functional Alignment] Describe how you align data science, platform engineering, and legal/security teams when shipping high-risk generative AI capabilities.",
      ],
    },
    mixed: {
      beginner: [
        "[Technical Fundamentals] In your own words, how does Retrieval-Augmented Generation (RAG) improve upon standard LLM prompting?",
        "[Behavioral Scenario] Tell me about a project where you had to quickly learn a new AI tool or library to solve an immediate problem.",
        "[Practical Design] How would you test a simple AI chatbot before showing it to users?",
        "[Communication] How do you explain the limitations and confidence levels of AI predictions to stakeholders?",
        "[Code Quality] What practices do you follow to ensure your machine learning or script code is clean and reproducible?",
      ],
      intermediate: [
        "[Day 8 · RAG Pipeline] Walk me through how you optimize chunk size and embedding retrieval for a specific domain search task.",
        "[Situational Judgment] If your team is debating whether to use an open-source model (e.g. Llama 3) versus a proprietary API (e.g. Gemini), what technical and business criteria would you evaluate?",
        "[Day 19 · Agent Architecture] How do you prevent infinite loops and runaway costs in agentic tool-calling workflows?",
        "[Conflict Resolution] Describe a time you and a team member disagreed on whether an AI model's accuracy was good enough for production.",
        "[Day 26 · Evaluation] What automated metrics would you track in production to monitor latency, cost, and hallucination rates?",
      ],
      advanced: [
        "[System Architecture] How do you design an enterprise-grade AI gateway with intelligent routing, prompt caching, fallback failover, and rate limiting?",
        "[Leadership Scenario] Describe a time you had to kill a promising AI prototype because production unit economics or latency did not justify the investment.",
        "[Deep Technical & Safety] Walk me through your approach to red-teaming and mitigating indirect prompt injection vulnerabilities in multi-agent tool execution.",
        "[Cross-Functional Influence] How do you communicate the trade-offs between model fine-tuning and retrieval-augmented context to C-level decision-makers?",
        "[Scale & Reliability] When orchestrating asynchronous batch evaluations across hundreds of test cases, how do you manage concurrency and cost efficiency?",
      ],
    },
  },
  "Web Development": {
    technical: {
      beginner: [
        "[Web Fundamentals] Explain the difference between client-side rendering (CSR) and server-side rendering (SSR), and when you would choose each.",
        "[State Management] How do you manage component state in React, and when is local state preferable to global state?",
        "[API Integration] What is the difference between REST and GraphQL, and how do you handle loading and error states when fetching data?",
        "[Performance] Name three primary techniques you use to improve initial page load times and Core Web Vitals.",
        "[TypeScript] Why is TypeScript beneficial in modern web applications, and how do you use interfaces versus type aliases?",
      ],
      intermediate: [
        "[Rendering & Hydration] Walk me through the React hydration lifecycle and common causes of hydration mismatch errors in modern frameworks like Next.js or TanStack Start.",
        "[State Architecture] How would you structure global caching and optimistic UI updates for a high-frequency real-time dashboard using TanStack Query?",
        "[Web Performance] How do you identify and eliminate unnecessary re-renders, layout shifts (CLS), and heavy JavaScript bundle overhead?",
        "[Security] What are the differences between CSRF, XSS, and CORS? How do you protect a single-page application and its authentication cookies?",
        "[Responsive Architecture] How do you design resilient component design systems using Tailwind CSS and accessible primitives (Radix/Headless UI)?",
      ],
      advanced: [
        "[Full-Stack Architecture] You are architecting a high-traffic web platform serving 50,000 concurrent users. Walk me through your CDN caching, Edge rendering, and data streaming strategy.",
        "[Micro-Frontends & Bundling] When are micro-frontends or module federation appropriate versus a modular monolith, and how do you optimize dependency deduplication with Rolldown/Vite?",
        "[Real-Time Collaboration] How would you architect a collaborative real-time canvas or document editor (e.g. using WebSockets, WebRTC, or CRDTs)?",
        "[Resilience & Observability] How do you design zero-downtime client-side rollouts with feature flagging, error boundaries, and real-user monitoring (RUM)?",
        "[Web Security & Auth] Design a secure authentication architecture supporting biometric WebAuthn, OAuth 2.0 PKCE flows, and secure session revocation across distributed nodes.",
      ],
    },
    behavioral: {
      beginner: [
        "[Communication] Tell me about a time you collaborated with a UI/UX designer to translate a Figma mockup into working code.",
        "[Debugging] Describe a tricky frontend bug you encountered and how you systematically tracked down the root cause.",
        "[Continuous Learning] Frontend tooling moves fast. How do you decide which frameworks or CSS methodologies to invest time in?",
        "[Teamwork] Tell me about a time you helped a teammate understand a frontend concept or assisted in code review.",
        "[Deadlines] How do you handle situations where a feature has unexpected UI complexities close to a release deadline?",
      ],
      intermediate: [
        "[Trade-offs] Describe a situation where product requirements clashed with web performance or accessibility standards. How did you negotiate a solution?",
        "[Cross-Functional Alignment] Tell me about a project where frontend and backend APIs were being developed simultaneously. How did you prevent integration bottlenecks?",
        "[Refactoring] Walk me through a significant frontend codebase refactoring you spearheaded. How did you ensure zero regression?",
        "[User Empathy] Tell me about a time you advocated for accessibility (a11y) or keyboard navigation improvements despite competing feature priorities.",
        "[Incident Management] Describe how you handled an urgent production frontend bug that impacted users on a live site.",
      ],
      advanced: [
        "[Engineering Leadership] How do you establish and maintain frontend engineering standards, component libraries, and testing coverage across multiple feature teams?",
        "[Strategic Decision Making] Tell me about a time you evaluated migrating an aging frontend stack to a modern architecture. How did you justify the business ROI?",
        "[Developer Experience] How do you measure and improve developer velocity, CI/CD build speeds, and local development DX for a large team?",
        "[Cross-Platform Strategy] Describe how you balance web versus native mobile investments for a core product feature.",
        "[Team Growth] How do you mentor senior engineers to grow into technical leaders and architectural decision makers?",
      ],
    },
    mixed: {
      beginner: [
        "[Core Technical] How does the DOM differ from the Virtual DOM, and how does React efficiently update UI changes?",
        "[Behavioral Experience] Tell me about a web application project you are most proud of building.",
        "[Practical Scenario] What steps do you take when a user reports that a button on your website is unresponsive on mobile devices?",
        "[Collaboration] How do you approach reviewing pull requests from your peers?",
        "[Accessibility] What are some simple habits you practice to ensure your HTML is semantic and accessible?",
      ],
      intermediate: [
        "[Technical Deep Dive] How do you implement robust client-side routing with route loaders, code-splitting, and error boundaries?",
        "[Scenario Judgment] If your frontend bundle size grew by 3MB after importing a visualization package, how would you resolve it?",
        "[Team Conflict] Tell me about a time you had a difference of opinion with a backend developer on API endpoint design.",
        "[State & Reliability] How do you prevent race conditions when handling multiple asynchronous form submissions?",
        "[User Experience] Walk me through how you design skeleton loaders and optimistic updates to improve perceived latency.",
      ],
      advanced: [
        "[System Design] Architect a real-time notification service for a web app that scales to millions of active socket connections with minimal battery drain.",
        "[Leadership & Quality] How do you introduce end-to-end automated testing (Playwright/Cypress) into a legacy project without slowing down delivery?",
        "[Performance Crisis] Describe a time you diagnosed a severe memory leak or CPU spike in a production single-page application.",
        "[Stakeholder Alignment] How do you present technical debt cleanup to product managers who only want new features?",
        "[Modern Web Standards] What is your take on React Server Components (RSC) versus static generation for dynamic consumer web applications?",
      ],
    },
  },
  "Data Analytics": {
    technical: {
      beginner: [
        "[SQL Fundamentals] What is the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN, and when would you use a GROUP BY with HAVING?",
        "[Data Cleaning] How do you handle missing values, outliers, and duplicate records in a raw dataset?",
        "[Metrics & KPIs] How do you choose the right visualization (e.g. line chart, bar chart, scatter plot, heatmap) for a given metric?",
        "[Python/Pandas] Explain how you use Pandas for data filtering, aggregation, and merging dataframes.",
        "[Business Understanding] What is the difference between correlation and causation in business analytics?",
      ],
      intermediate: [
        "[Advanced SQL] Walk me through how and when you use SQL window functions (e.g. ROW_NUMBER, RANK, LAG/LEAD) for cohort analysis.",
        "[Pipeline & Modeling] How do you design a robust data pipeline that ingests daily transactional data and updates analytical dashboards reliably?",
        "[A/B Testing] How do you determine sample size, statistical significance (p-values), and confidence intervals when evaluating an A/B test?",
        "[Data Warehousing] What are the differences between star schema and snowflake schema in dimensional modeling (e.g. in Snowflake or BigQuery)?",
        "[Anomaly Detection] How do you build automated monitoring to detect sudden drops or spikes in critical business metrics?",
      ],
      advanced: [
        "[Enterprise Data Architecture] Architect a scalable modern data stack supporting real-time streaming analytics and historical batch processing for 100M daily events.",
        "[Causal Inference] Beyond standard A/B testing, how do you estimate treatment effects when randomization is impossible (e.g. Difference-in-Differences, Synthetic Controls)?",
        "[Data Governance & Quality] How do you implement automated data contracts, schema evolution, and lineage tracking across distributed analytics teams?",
        "[Cost Optimization] How do you optimize query execution plans, partition pruning, and cluster sizing in cloud data warehouses to reduce compute costs by 40%?",
        "[Executive Analytics] How do you synthesize complex multi-touch attribution models into actionable strategic recommendations for executive leadership?",
      ],
    },
    behavioral: {
      beginner: [
        "[Communication] Tell me about a time you presented data findings to a business team that changed their decision.",
        "[Attention to Detail] Describe an instance where you caught an error in data before it was sent to stakeholders.",
        "[Curiosity] How do you approach exploring an unfamiliar dataset to discover meaningful business insights?",
        "[Collaboration] Tell me about a time you worked with non-technical partners to define analytical requirements.",
        "[Prioritization] When multiple teams request ad-hoc reports simultaneously, how do you prioritize?",
      ],
      intermediate: [
        "[Challenging Assumptions] Tell me about a time when your data analysis contradicted a senior stakeholder's intuition or hypothesis. How did you communicate the results?",
        "[Ambiguity] Describe a project where the business question was vague and undefined. How did you scope and deliver meaningful metrics?",
        "[Data Ethics] Have you ever encountered misleading metrics or biased interpretation of numbers? How did you address it?",
        "[Cross-Functional Alignment] Walk me through how you partner with engineering teams to fix upstream data tracking bugs.",
        "[Impact] Describe a data project you led that directly drove revenue growth or cost savings.",
      ],
      advanced: [
        "[Strategic Influence] Tell me about a time your analytics organization influenced company-wide strategy or pivot.",
        "[Building Analytics Teams] How do you structure data analytics, business intelligence, and analytics engineering roles for scale?",
        "[Executive Presentation] Describe how you delivered difficult analytical truths (e.g. failing product metric) to C-level executives.",
        "[Data Democratization] How do you empower non-analysts with self-service BI tools while maintaining single-source-of-truth data integrity?",
        "[Stakeholder Conflict] Tell me about resolving a dispute between two department heads whose metrics showed contradictory stories.",
      ],
    },
    mixed: {
      beginner: [
        "[SQL & Analysis] How do you calculate Month-over-Month (MoM) revenue growth using SQL and visualize it clearly?",
        "[Storytelling] Tell me about a time you turned raw numbers into a compelling business story.",
        "[Scenario] If a dashboard shows a sudden 20% drop in active users today, what are the first 3 things you check?",
        "[Collaboration] How do you handle feedback when a stakeholder asks for changes to your analysis?",
        "[Tooling] Which data tools (Python, R, Tableau, PowerBI, SQL) do you find most effective for quick exploratory work?",
      ],
      intermediate: [
        "[Technical Metric Design] How do you define and calculate Customer Lifetime Value (LTV) and Churn Rate in an irregular subscription model?",
        "[Communication Challenge] Describe presenting an inconclusive A/B test result to an eager product team.",
        "[Pipeline Reliability] What automated validation checks do you write in dbt or Python to catch data pipeline drift?",
        "[Stakeholder Alignment] How do you prevent metric fragmentation across sales, marketing, and finance departments?",
        "[Predictive Modeling] When would you recommend a simple regression model over a complex machine learning approach for business forecasting?",
      ],
      advanced: [
        "[Architectural Design] Design a complete analytics ecosystem for an e-commerce platform tracking user journeys from initial ad impression to recurring purchase.",
        "[Leadership Scenario] How do you balance supporting urgent ad-hoc executive requests against long-term data warehouse modeling initiatives?",
        "[Advanced Causal Analysis] Walk me through how you measure the true incrementality of marketing campaigns when organic search and paid ads overlap.",
        "[Organizational Impact] Tell me about building a data-informed experimentation culture across an entire product division.",
        "[Data Governance Strategy] How do you ensure GDPR/CCPA compliance and PII masking without hindering business analysts' productivity?",
      ],
    },
  },
  "Software Development": {
    technical: {
      beginner: [
        "[OOP & Design] Explain the four fundamental principles of Object-Oriented Programming (OOP) and why modularity matters in software.",
        "[Data Structures] When would you choose a Hash Table over a Linked List or Array? What are the time complexities for lookup and insertion?",
        "[Version Control] Walk through how you use Git branching, commits, and pull requests in a professional team workflow.",
        "[Testing] What is the difference between unit tests, integration tests, and end-to-end tests?",
        "[Clean Code] What habits or principles (like DRY or SOLID) do you apply daily to write maintainable code?",
      ],
      intermediate: [
        "[System Design Fundamentals] How do you design a scalable URL shortener service (like Bitly)? Walk me through the database schema, hashing algorithm, and caching tier.",
        "[Concurrency & Async] What is the difference between concurrency and parallelism, and how do you prevent race conditions and deadlocks in multi-threaded code?",
        "[API Design] How do you design idempotent RESTful APIs, and what HTTP status codes and headers do you use for error handling and rate limiting?",
        "[Database Optimization] How do database indexes (B-Trees) work internally, and how do you troubleshoot slow queries using EXPLAIN ANALYZE?",
        "[CI/CD & DevOps] Describe your ideal continuous integration and deployment pipeline from pull request to production container deployment.",
      ],
      advanced: [
        "[Distributed Systems] You are designing a distributed rate limiter for an API gateway handling 100,000 requests per second. Compare Token Bucket vs. Sliding Window Log using Redis.",
        "[Event-Driven Architecture] How do you guarantee at-least-once vs. exactly-once message delivery when using Apache Kafka or RabbitMQ with outbox patterns?",
        "[High Availability & CAP] Explain how you handle network partition splits in a distributed database and how you choose between CP and AP based on business criticality.",
        "[Microservices Decomposition] How do you break down a legacy monolith into domain-driven microservices without disrupting ongoing feature delivery?",
        "[Reliability & SRE] Walk me through implementing circuit breakers, bulkhead isolation, and automated canary rollbacks for critical microservices.",
      ],
    },
    behavioral: {
      beginner: [
        "[Code Reviews] Tell me about a time you received constructive feedback on a pull request and how you incorporated it.",
        "[Debugging Story] Describe a difficult software bug you solved and the diagnostic steps you took.",
        "[Teamwork] Tell me about working on a team project where tasks had to be split among several engineers.",
        "[Technical Curiosity] How do you explore new programming languages or tools outside of your immediate daily work?",
        "[Estimation] How do you estimate how long a software task will take, and what do you do if you realize you are running behind?",
      ],
      intermediate: [
        "[Technical Disagreement] Describe a situation where you and a colleague strongly disagreed on a software architecture approach. How did you reach consensus?",
        "[Production Incident] Walk me through a time you were on-call or involved in resolving an active production outage. What was your process?",
        "[Legacy Code] Tell me about inheriting or working on a legacy codebase with little documentation. How did you navigate and improve it?",
        "[Trade-offs] Describe a time you had to sacrifice code elegance or technical perfection to meet a critical business milestone.",
        "[Mentorship] Tell me about a time you helped mentor an intern or junior developer in software engineering practices.",
      ],
      advanced: [
        "[Technical Strategy] Tell me about driving a major architectural migration across multiple services. How did you gain buy-in from multiple engineering squads?",
        "[Crisis Leadership] Describe leading the post-incident review (PIR) for a severe security breach or data loss event. How did you drive blameless accountability?",
        "[Hiring & Scaling] How do you design technical interview loops and maintain a high engineering hiring bar while scaling a department?",
        "[Engineering Velocity] What strategies have you used to reduce build times, flakey tests, and deployment friction for 50+ developers?",
        "[Cross-Functional Alignment] Tell me about collaborating with security, compliance, and product managers to deliver a compliant enterprise system on schedule.",
      ],
    },
    mixed: {
      beginner: [
        "[Technical Concept] Explain how recursion works and when an iterative approach is preferable.",
        "[Behavioral Reflection] Tell me about a challenging coding problem you solved recently.",
        "[Practical Scenario] What is your process when a test fails right before a scheduled release?",
        "[Collaboration] How do you write clear documentation and pull request descriptions for your teammates?",
        "[Software Quality] What tools (linters, formatters, static analyzers) do you rely on to maintain code standards?",
      ],
      intermediate: [
        "[System Design] Walk me through designing an in-memory caching system with an LRU (Least Recently Used) eviction policy.",
        "[Incident Scenario] If your server CPU utilization spikes to 100% after a deployment, what immediate actions do you take?",
        "[Cross-Team Collaboration] Tell me about coordinating an API change with another team that depended on your service.",
        "[Technical Debt] How do you track, prioritize, and pay down technical debt alongside new product features?",
        "[Security Mindset] What precautions do you take to prevent SQL injection and unauthorized data access in your backend services?",
      ],
      advanced: [
        "[Distributed Architecture] How would you architect a distributed job scheduler capable of executing millions of delayed cron tasks reliably?",
        "[Engineering Leadership] Describe a time you had to push back on unrealistic deadlines without damaging stakeholder relationships.",
        "[Resilience & Chaos] How do you use chaos engineering principles and load testing to validate system resilience before Black Friday traffic?",
        "[Strategic Decision] Walk me through deciding between building a custom internal tool versus purchasing a SaaS third-party solution.",
        "[Culture of Excellence] How do you foster an engineering environment that balances fast shipping with rigorous automated testing and observability?",
      ],
    },
  },
};

// Fallback for "Other" or custom domains
function getQuestionsForDomain(
  domain: string,
  type: InterviewType,
  difficulty: DifficultyLevel,
): string[] {
  // Normalize domain
  let matchedKey = "Software Development";
  if (
    domain.toLowerCase().includes("ai") ||
    domain.toLowerCase().includes("ml") ||
    domain.toLowerCase().includes("llm") ||
    domain.toLowerCase().includes("rag")
  ) {
    matchedKey = "AI/ML";
  } else if (
    domain.toLowerCase().includes("web") ||
    domain.toLowerCase().includes("frontend") ||
    domain.toLowerCase().includes("full") ||
    domain.toLowerCase().includes("react")
  ) {
    matchedKey = "Web Development";
  } else if (
    domain.toLowerCase().includes("data") ||
    domain.toLowerCase().includes("analytics") ||
    domain.toLowerCase().includes("sql") ||
    domain.toLowerCase().includes("bi")
  ) {
    matchedKey = "Data Analytics";
  }

  const domainGroup = DOMAIN_QUESTIONS[matchedKey] ?? DOMAIN_QUESTIONS["Software Development"];
  const typeGroup = domainGroup[type] ?? domainGroup.technical;
  return typeGroup[difficulty] ?? typeGroup.intermediate;
}

function evaluateAnswerMock(
  answer: string,
  turn: number,
  interviewType: InterviewType,
  difficulty: DifficultyLevel,
): AnswerEvaluation {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const length = words.length;

  let baseScore = 7;
  let relevance = 8;
  let clarity = 8;
  let technicalKnowledge = 7;
  let communication = 8;

  if (length < 8) {
    baseScore = 4;
    relevance = 5;
    clarity = 5;
    technicalKnowledge = 4;
    communication = 5;
  } else if (length < 20) {
    baseScore = 6;
    relevance = 7;
    clarity = 7;
    technicalKnowledge = 6;
    communication = 7;
  } else if (length > 60) {
    baseScore = 9;
    relevance = 9;
    clarity = 9;
    technicalKnowledge = 9;
    communication = 9;
  } else {
    baseScore = 8;
    relevance = 8;
    clarity = 8;
    technicalKnowledge = 8;
    communication = 8;
  }

  // Adjust for difficulty expectation
  if (difficulty === "advanced" && length < 30) {
    technicalKnowledge = Math.max(4, technicalKnowledge - 2);
  }

  const rating = baseScore >= 8 ? "strong" : baseScore >= 6 ? "moderate" : "weak";

  let feedbackNote = "";
  if (rating === "strong") {
    feedbackNote = "Thorough answer with concrete technical depth and clear reasoning.";
  } else if (rating === "moderate") {
    feedbackNote =
      "Good baseline answer. Providing specific architectural trade-offs or metric examples would elevate it.";
  } else {
    feedbackNote =
      "A bit brief. Aim to explain the 'why' behind decisions and illustrate with concrete scenarios.";
  }

  return {
    relevance,
    clarity,
    technicalKnowledge,
    communication,
    rating,
    feedbackNote,
    strengths:
      rating === "strong"
        ? ["Demonstrated sound conceptual grasp", "Clear articulation of trade-offs"]
        : ["Addressed the core question"],
    gaps:
      rating === "weak"
        ? ["Lacked deep architectural detail", "Missing concrete metrics or examples"]
        : [],
  };
}

function calculateOverallScores(evaluations: AnswerEvaluation[]): ScoreBreakdown {
  if (!evaluations.length) {
    return {
      overallScore: 82,
      technicalKnowledge: 80,
      communication: 85,
      answerRelevance: 84,
      problemSolving: 80,
      performanceTier: "Solid Competency",
    };
  }

  const avgRel = evaluations.reduce((acc, e) => acc + e.relevance, 0) / evaluations.length;
  const avgCla = evaluations.reduce((acc, e) => acc + e.clarity, 0) / evaluations.length;
  const avgTech =
    evaluations.reduce((acc, e) => acc + e.technicalKnowledge, 0) / evaluations.length;
  const avgComm = evaluations.reduce((acc, e) => acc + e.communication, 0) / evaluations.length;

  const technicalKnowledge = Math.min(100, Math.round(avgTech * 10));
  const communication = Math.min(100, Math.round(avgComm * 10));
  const answerRelevance = Math.min(100, Math.round(avgRel * 10));
  const problemSolving = Math.min(100, Math.round(((avgTech + avgCla) / 2) * 10));

  const overallScore = Math.round(
    technicalKnowledge * 0.35 + communication * 0.25 + answerRelevance * 0.2 + problemSolving * 0.2,
  );

  let performanceTier: ScoreBreakdown["performanceTier"] = "Solid Competency";
  if (overallScore >= 88) performanceTier = "Exceptional";
  else if (overallScore >= 78) performanceTier = "Strong Hire";
  else if (overallScore >= 65) performanceTier = "Solid Competency";
  else performanceTier = "Needs Practice";

  return {
    overallScore,
    technicalKnowledge,
    communication,
    answerRelevance,
    problemSolving,
    performanceTier,
  };
}

function generateWeakAreaPractice(
  domain: string,
  interviewType: InterviewType,
  difficulty: DifficultyLevel,
  scores: ScoreBreakdown,
): WeakAreaPractice {
  if (interviewType === "behavioral" || scores.communication < scores.technicalKnowledge) {
    return {
      weakAreaTitle: "Behavioral STAR Articulation & Leadership Framing",
      weakAreaDescription:
        "Your technical insights are solid, but framing answers using Situation-Task-Action-Result (STAR) with quantified business outcomes will make leadership responses stand out.",
      recommendedFocus: "STAR Method, Stakeholder Conflict Resolution, and Metric Impact",
      questions: [
        {
          id: "p1",
          topic: "Conflict Resolution & Alignment",
          question:
            "Describe a high-stakes scenario where you had to push back on an unrealistic engineering deadline or feature scope. How did you maintain trust while negotiating?",
          keyPointsToInclude: [
            "Clearly state the initial situation and business risk",
            "Explain your data-backed alternative proposal",
            "Detail the negotiation process with empathy",
            "Highlight the final quantified outcome or delivery success",
          ],
        },
        {
          id: "p2",
          topic: "Incident Post-Mortem & Blameless Ownership",
          question:
            "Walk me through a severe production bug or deployment error that you were directly responsible for. How did you remedy it and what guardrails did you institute?",
          keyPointsToInclude: [
            "Acknowledge responsibility directly without shifting blame",
            "Immediate containment actions taken during the outage",
            "Root-cause analysis (5 Whys approach)",
            "Automated test or CI/CD gate added to permanently prevent recurrence",
          ],
        },
        {
          id: "p3",
          topic: "Cross-Functional Influence",
          question:
            "Tell me about a time you had to convince non-technical leadership to invest in technical debt refactoring rather than shipping user-facing features.",
          keyPointsToInclude: [
            "Translate technical debt into business metrics (churn, latency, developer velocity, compute costs)",
            "Propose an incremental refactoring plan rather than a total freeze",
            "Demonstrate post-migration performance wins",
          ],
        },
      ],
    };
  }

  // Technical Domain Weak Area Practice
  if (domain.includes("AI") || domain.includes("ML") || domain.includes("RAG")) {
    return {
      weakAreaTitle: "System Architecture, Retrieval Evaluation & Edge Cases",
      weakAreaDescription:
        "Focus on offline evaluation metrics (Recall@k, Faithfulness), latency optimization in vector search, and loop bounding in autonomous agent execution.",
      recommendedFocus:
        "RAG Triad Evaluation, Vector Indexing at Scale, and Multi-Agent Orchestration Guardrails",
      questions: [
        {
          id: "p1",
          topic: "RAG Offline Evaluation Metrics",
          question:
            "How would you build an automated CI evaluation pipeline to test if an updated embedding model improves retrieval recall without causing hallucination regressions?",
          keyPointsToInclude: [
            "Golden dataset curation with question-answer-context triples",
            "Metrics: Context Recall@k, Context Precision, Faithfulness, and Answer Relevance (RAGAS/TruLens)",
            "Setting statistical regression thresholds in GitHub Actions",
            "A/B shadow deployment before 100% traffic shift",
          ],
        },
        {
          id: "p2",
          topic: "Vector Search Scaling & Latency Optimization",
          question:
            "If your vector search queries spike to 500ms p99 latency on a 10M document index, what specific indexing parameters (HNSW M, efConstruction, efSearch) and caching layers would you tune?",
          keyPointsToInclude: [
            "HNSW graph parameters trade-off: efSearch vs recall vs query latency",
            "Scalar quantization / Product Quantization (PQ) for RAM reduction",
            "Semantic caching for recurring or high-frequency prompt embeddings",
            "Two-stage retrieval: lightweight ANN candidate generation followed by cross-encoder re-ranking",
          ],
        },
        {
          id: "p3",
          topic: "Agent Guardrails & Loop Bounding",
          question:
            "Design the execution safeguards for an autonomous coding agent with shell execution tools to guarantee it cannot execute malicious commands or enter infinite billing loops.",
          keyPointsToInclude: [
            "Strict step budget / recursion limit (e.g. max 8 tool calls per turn)",
            "Containerized sandboxing with ephemeral filesystem and network egress controls",
            "Deterministic loop detection (hashing tool inputs/outputs to detect repetition)",
            "Hard token and financial cost circuit breakers",
          ],
        },
      ],
    };
  }

  // General Software / Web Development weak area
  return {
    weakAreaTitle: "Scalability, Concurrency & Distributed System Trade-offs",
    weakAreaDescription:
      "Deepen your explanations of caching invalidation, horizontal scaling constraints, database indexing internals, and resilient failure recovery.",
    recommendedFocus:
      "Database Query Optimization, Distributed Locking, and Resilient API Gateway Design",
    questions: [
      {
        id: "p1",
        topic: "Database Indexing & Query Plans",
        question:
          "Explain how a composite B-Tree index (colA, colB, colC) works internally. Which WHERE clause combinations can utilize this index, and how do you diagnose index misses with EXPLAIN?",
        keyPointsToInclude: [
          "Leftmost prefix rule in multi-column B-Tree indexes",
          "Understanding Index Scan vs. Index Only Scan vs. Sequential Scan",
          "Impact of range operators (<, >) stopping subsequent column index usage",
          "Covering indexes and eliminating heap lookups",
        ],
      },
      {
        id: "p2",
        topic: "Distributed Rate Limiting & Concurrency",
        question:
          "Design a distributed rate limiter for 100k req/sec across 20 web servers using Redis. How do you prevent race conditions without locking the entire cache?",
        keyPointsToInclude: [
          "Sliding window counter algorithm using Redis Sorted Sets (ZADD/ZREMRANGEBYSCORE)",
          "Atomic execution using Lua scripts to eliminate race conditions",
          "Local in-memory token bucket caching to reduce Redis roundtrips",
          "Graceful degradation when Redis is temporarily unavailable",
        ],
      },
      {
        id: "p3",
        topic: "Zero-Downtime Database Schema Migrations",
        question:
          "How do you safely rename a heavily queried database column in a production table with 50M rows without taking downtime or locking reads/writes?",
        keyPointsToInclude: [
          "Expand-and-contract / Parallel run migration pattern",
          "Step 1: Add new column, Step 2: Write to both old and new columns, Step 3: Backfill historical data in batches",
          "Step 4: Shift reads to new column, Step 5: Stop writing to old column and drop old column",
        ],
      },
    ],
  };
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockInterview(body: InterviewRequest): Promise<InterviewResponse> {
  await delay(600 + Math.random() * 400);

  // START REQUEST
  if ("candidate" in body) {
    const cand = body.candidate as Candidate;
    const name = String(cand.name || "Candidate").trim() || "Candidate";
    const firstName = name.split(" ")[0] || name;
    const domain = String(cand.domain || cand.field || "AI/ML");
    const role = String(cand.role || cand.field || domain);
    const interviewType = (cand.interviewType || "technical") as InterviewType;
    const difficulty = (cand.difficulty || "intermediate") as DifficultyLevel;
    const skills = Array.isArray(cand.skills)
      ? (cand.skills as string[])
      : Array.isArray(cand.focusAreas)
        ? (cand.focusAreas as string[])
        : [domain];

    const questionsList = getQuestionsForDomain(domain, interviewType, difficulty);

    sessions.set(body.sessionId, {
      sessionId: body.sessionId,
      turn: 0,
      candidateName: firstName,
      domain,
      role,
      interviewType,
      difficulty,
      skills,
      answers: [],
      questions: questionsList,
      evaluations: [],
    });

    const typeDisplay =
      interviewType === "technical"
        ? "Technical Interview"
        : interviewType === "behavioral"
          ? "HR / Behavioral Interview"
          : "Mixed Technical & Behavioral Interview";

    const diffDisplay = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

    const firstQuestion = questionsList[0] || "Tell me about your background and experience.";

    return {
      reply: `Welcome ${firstName}! I am your AI interviewer for today's **${typeDisplay}** focused on **${domain}** (${diffDisplay} level).\n\nWe'll cover core topics, architecture, and practical problem-solving. Take your time to structure your thoughts and provide specific details.\n\n${firstQuestion}`,
      done: false,
    };
  }

  // TURN REQUEST
  const session = sessions.get(body.sessionId);
  if (!session) {
    return {
      reply: "Session expired or not found. Please start a new interview session.",
      done: true,
    };
  }

  const answer = body.message;
  session.answers.push(answer);

  // Evaluate current answer
  const evaluation = evaluateAnswerMock(
    answer,
    session.turn,
    session.interviewType,
    session.difficulty,
  );
  session.evaluations.push(evaluation);
  session.turn += 1;

  // Check if we still have questions in script
  if (session.turn < session.questions.length) {
    const nextQ = session.questions[session.turn];
    const ackPhrases = [
      "Thank you for that explanation.",
      "Good, that addresses the core point.",
      "Understood — appreciate the practical context.",
      "Great insights on that topic.",
    ];
    const ack = ackPhrases[session.turn % ackPhrases.length];

    return {
      reply: `${ack}\n\n${nextQ}`,
      done: false,
      evaluation,
    };
  }

  // FINAL FEEDBACK GENERATION
  const scores = calculateOverallScores(session.evaluations);
  const weakAreaPractice = generateWeakAreaPractice(
    session.domain,
    session.interviewType,
    session.difficulty,
    scores,
  );

  const thoroughCount = session.answers.filter((a) => a.trim().split(/\s+/).length > 30).length;

  const strengthsList = [
    `Strong conceptual clarity across ${session.domain} principles and key fundamentals`,
    `Approaches problem-solving with practical trade-offs rather than purely theoretical definitions`,
    session.interviewType === "behavioral"
      ? "Demonstrates collaborative mindset and constructive communication style"
      : "Structured thinking when diagnosing edge cases and system performance bottlenecks",
  ];

  const gapsList = [
    session.difficulty === "advanced"
      ? "Could provide deeper quantitative offline evaluation metrics and scaling benchmarks"
      : "Opportunity to enrich answers with more specific code-level or architectural edge cases",
    "Look for opportunities to proactively frame responses around business impact and failure recovery",
  ];

  const nextStepsList = [
    `Complete targeted drills in ${weakAreaPractice.weakAreaTitle}`,
    `Review system design patterns and production latency optimization for ${session.domain}`,
    "Practice structured whiteboard-style problem walkthroughs with concrete metrics",
  ];

  return {
    reply:
      "Interview completed! Thank you for walking through those questions in detail. I have synthesized your complete assessment and score breakdown below.",
    done: true,
    evaluation,
    feedback: {
      summary: `${session.candidateName} completed a comprehensive ${session.difficulty}-level ${session.interviewType} interview in ${session.domain}. The session evaluated ${session.questions.length} distinct questions covering core concepts, architectural reasoning, and practical trade-offs. Overall performance demonstrated ${thoroughCount >= 3 ? "consistently strong" : "developing"} depth, with an overall score of ${scores.overallScore}/100 (${scores.performanceTier}).`,
      strengths: strengthsList,
      gaps: gapsList,
      next: nextStepsList,
      scores,
      weakAreaPractice,
      answerEvaluations: session.evaluations,
    },
  };
}
