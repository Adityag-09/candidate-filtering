const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate");

// POST /api/match — Basic skill-matching & ranking
router.post("/", async (req, res) => {
  try {
    const { requiredSkills, minExperience = 0, preferredSkills = [] } = req.body;

    if (!requiredSkills || requiredSkills.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "requiredSkills is required" });
    }

    const candidates = await Candidate.find();

    // Normalize for case-insensitive comparison
    const reqSkillsLower = requiredSkills.map((s) => s.toLowerCase().trim());
    const prefSkillsLower = preferredSkills.map((s) => s.toLowerCase().trim());

    const results = candidates
      .map((candidate) => {
        const candidateSkillsLower = candidate.skills.map((s) =>
          s.toLowerCase().trim()
        );

        // Required skill matches
        const matchedSkills = requiredSkills.filter((skill) =>
          candidateSkillsLower.includes(skill.toLowerCase().trim())
        );

        // Preferred skill matches
        const matchedPreferred = preferredSkills.filter((skill) =>
          candidateSkillsLower.includes(skill.toLowerCase().trim())
        );

        // Core score from required skills (0-1)
        const coreScore = matchedSkills.length / reqSkillsLower.length;

        // Preferred bonus: up to 0.15 extra
        const prefBonus =
          prefSkillsLower.length > 0
            ? (matchedPreferred.length / prefSkillsLower.length) * 0.15
            : 0;

        // Experience bonus: small boost for exceeding min experience
        const expBonus =
          candidate.experience > minExperience
            ? Math.min((candidate.experience - minExperience) * 0.02, 0.1)
            : 0;

        const totalScore = Math.min(coreScore + prefBonus + expBonus, 1);
        const meetsExperience = candidate.experience >= minExperience;

        // Tier assignment
        let tier;
        if (totalScore >= 0.7 && meetsExperience) tier = "High";
        else if (totalScore >= 0.4 && meetsExperience) tier = "Medium";
        else tier = "Low";

        return {
          _id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          skills: candidate.skills,
          experience: candidate.experience,
          projects: candidate.projects,
          matchScore: Math.round(totalScore * 100),
          matchedSkills,
          matchedPreferred,
          meetsExperience,
          tier,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
