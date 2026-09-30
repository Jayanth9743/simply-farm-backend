export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_REGEX = {
  uppercase: /[A-Z]/,
  number: /[0-9]/,
  symbol: /[^A-Za-z0-9]/,
};

export const AUTH_MESSAGES = {
  PASSWORD_MIN: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  PASSWORD_UPPERCASE: "Password must contain at least one uppercase letter",
  PASSWORD_NUMBER: "Password must contain at least one number",
  PASSWORD_SYMBOL: "Password must contain at least one symbol",
  INVALID_EMAIL: "Invalid email address",
  NAME_MIN: `Name must be at least ${NAME_MIN_LENGTH} characters`,
  NAME_MAX: `Name must be at most ${NAME_MAX_LENGTH} characters`,
};