export function stripMatchingH1(text: string, title: string): string {
  return text.replace(/^\uFEFF?\s*#\s+(.+?)\s*(?:\r?\n|$)/, (full, heading: string) => {
    return heading.trim() === title.trim() ? "" : full;
  });
}
