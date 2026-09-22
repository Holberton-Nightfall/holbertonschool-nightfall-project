// Règles de robustesse partagées entre Inscription et Mon compte (changement de mot de passe).
export const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, label: '8 caractères minimum' },
  { test: (p) => /[A-Z]/.test(p), label: 'une majuscule' },
  { test: (p) => /[^A-Za-z0-9]/.test(p), label: 'un caractère spécial' },
];

export const isPasswordValid = (p) => PASSWORD_RULES.every((rule) => rule.test(p));
