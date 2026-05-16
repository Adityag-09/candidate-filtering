const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate");

// POST /api/candidates — Add a new candidate
router.post("/", async (req, res) => {
  try {
    const { name, email, skills, experience, projects } = req.body;

    // Normalize skills: trim whitespace, capitalize first letter
    const normalizedSkills = skills.map(
      (s) => s.trim().charAt(0).toUpperCase() + s.trim().slice(1)
    );

    const candidate = new Candidate({
      name,
      email,
      skills: normalizedSkills,
      experience,
      projects: projects || "",
    });

    await candidate.save();
    res.status(201).json({ success: true, data: candidate });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, error: "Email already exists" });
    }
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/candidates — Get all candidates (optional ?search= filter)
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query = {
        $or: [
          { name: regex },
          { email: regex },
          { skills: { $elemMatch: { $regex: regex } } },
        ],
      };
    }

    const candidates = await Candidate.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: candidates.length, data: candidates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/candidates/:id — Remove a candidate
router.delete("/:id", async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, error: "Candidate not found" });
    }
    res.json({ success: true, data: candidate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
