const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// POST /api/ai/shortlist — AI-powered candidate ranking
router.post("/shortlist", async (req, res) => {
  try {
    const { requiredSkills, minExperience = 0, preferredSkills = [] } = req.body;

    if (!requiredSkills || requiredSkills.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "requiredSkills is required" });
    }

    const candidates = await Candidate.find();

    if (candidates.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No candidates in database" });
    }

    // Build candidate list for prompt
    const candidateList = candidates
      .map(
        (c, i) =>
          `${i + 1}. ${c.name} (${c.email}) — Skills: ${c.skills.join(", ")} — Experience: ${c.experience} years${c.projects ? ` — Bio: ${c.projects}` : ""}`
      )
      .join("\n");

    const prompt = `You are an expert technical recruiter AI. Analyze the following candidates against the job requirements and rank them from best to worst fit.

Job Requirements:
- Required Skills: ${requiredSkills.join(", ")}
- Minimum Experience: ${minExperience} years
${preferredSkills.length > 0 ? `- Preferred Skills: ${preferredSkills.join(", ")}` : ""}

Candidates:
${candidateList}

For each candidate, provide:
1. A match score (0-100)
2. A tier: "High", "Medium", or "Low"
3. A brief explanation of why they are/aren't a good fit

Respond ONLY with valid JSON in this exact format (no markdown, no code fences):
{
  "rankings": [
    {
      "name": "candidate name",
      "email": "candidate email",
      "matchScore": 85,
      "tier": "High",
      "explanation": "Brief explanation..."
    }
  ]
}

Sort from highest to lowest match score.`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ success: false, error: "OpenRouter API key not configured" });
    }

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "Candidate Shortlisting System",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("OpenRouter error:", errBody);
      return res.status(502).json({
        success: false,
        error: "AI service returned an error",
        details: errBody,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res
        .status(502)
        .json({ success: false, error: "No response from AI" });
    }

    // Parse AI response
    let parsed;
    try {
      // Strip markdown code fences if present
      const cleaned = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", content);
      return res.status(502).json({
        success: false,
        error: "Failed to parse AI response",
        rawResponse: content,
      });
    }

    // Enrich with original candidate data
    const enriched = parsed.rankings.map((r) => {
      const original = candidates.find(
        (c) => c.email === r.email || c.name === r.name
      );
      return {
        ...r,
        _id: original?._id,
        skills: original?.skills || [],
        experience: original?.experience || 0,
        projects: original?.projects || "",
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    console.error("AI shortlist error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/interview-questions — Generate interview questions
router.post("/interview-questions", async (req, res) => {
  try {
    const { candidateName, skills, experience, jobSkills } = req.body;

    const prompt = `You are an expert technical interviewer. Generate 5 targeted interview questions for a candidate with the following profile:

Candidate: ${candidateName}
Skills: ${skills.join(", ")}
Experience: ${experience} years
Job requires: ${jobSkills.join(", ")}

Generate questions that:
1. Test their claimed skills
2. Assess practical experience
3. Include at least one system design question
4. Include at least one behavioral question

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "questions": [
    {
      "question": "...",
      "category": "Technical" | "System Design" | "Behavioral" | "Problem Solving",
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ]
}`;

    const apiKey = process.env.OPENROUTER_API_KEY;

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "Candidate Shortlisting System",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return res.status(502).json({
        success: false,
        error: "AI service error",
        details: errBody,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let parsed;
    try {
      const cleaned = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(502).json({
        success: false,
        error: "Failed to parse AI response",
        rawResponse: content,
      });
    }

    res.json({ success: true, data: parsed.questions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
