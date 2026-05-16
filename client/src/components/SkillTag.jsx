export default function SkillTag({ skill, matched, onRemove }) {
  return (
    <span className={`skill-tag ${matched ? 'matched' : ''}`}>
      {skill}
      {onRemove && (
        <span className="remove-skill" onClick={onRemove}>×</span>
      )}
    </span>
  );
}
