// Restricted to @deanza.edu / @fhda.edu in an earlier version. Loosened to
// any well-formed email for now — re-enable the domain check (swap the
// regex below) once student verification comes back.
export const COLLEGE_EMAIL_PATTERN = /^[^\s@]+@(deanza\.edu|fhda\.edu)$/i;
const GENERIC_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isCollegeEmail(email: string): boolean {
  return GENERIC_EMAIL_PATTERN.test(email);
}
