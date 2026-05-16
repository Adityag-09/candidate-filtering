import { useState } from 'react';

export default function SkillInput({ skills, setSkills }) {
  const [value, setValue] = useState('');

  const addSkill = () => {
    const trimmed = value.trim();
    if (trimmed && !skills.find(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
      setValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    } else if (e.key === 'Backspace' && !value && skills.length > 0) {
      setSkills(skills.slice(0, -1));
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="skill-input-wrapper">
      {skills.map((skill, i) => (
        <span key={i} className="skill-tag">
          {skill}
          <span className="remove-skill" onClick={() => removeSkill(i)}>×</span>
        </span>
      ))}
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addSkill}
        placeholder={skills.length === 0 ? 'Type a skill and press Enter...' : 'Add more...'}
      />
    </div>
  );
}
