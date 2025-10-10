export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_RE =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,64}$/;
export const PHONE_IL_RE = /^0\d{1,2}-?\d{7}$/;
export const URL_RE = /^(https?:\/\/)([\w.-]+)(:[0-9]+)?(\/[^\s]*)?$/;
