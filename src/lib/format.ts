export function getAnimalsWord(count: number) {
  const absCount = Math.abs(count);
  const lastTwoDigits = absCount % 100;
  const lastDigit = absCount % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "тварин";
  }

  if (lastDigit === 1) {
    return "тварина";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "тварини";
  }

  return "тварин";
}

export function getDescriptionParagraphs(
  description: string,
  fallbackText: string
) {
  const paragraphs = description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length > 0) {
    return paragraphs;
  }

  return [fallbackText];
}
