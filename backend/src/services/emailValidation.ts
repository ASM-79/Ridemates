export const COLLEGE_EMAIL_PATTERN = /^[^\s@]+@(deanza\.edu|fhda\.edu)$/i;

export function isCollegeEmail(email: string): boolean {
  return COLLEGE_EMAIL_PATTERN.test(email);
}
