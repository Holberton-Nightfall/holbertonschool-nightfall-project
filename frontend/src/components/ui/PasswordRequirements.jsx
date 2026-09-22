import { PASSWORD_RULES } from '../../lib/passwordRules.js';

// Liste les critères de robustesse un par un, chacun passant en turquoise dès qu'il est rempli.
export default function PasswordRequirements({ password }) {
  return (
    <ul className="flex flex-col gap-0.5 text-xs">
      {PASSWORD_RULES.map((rule) => {
        const valid = rule.test(password);
        return (
          <li key={rule.label} className={valid ? 'text-accent-2' : 'text-text-muted'}>
            {valid ? '✓' : '•'} {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
