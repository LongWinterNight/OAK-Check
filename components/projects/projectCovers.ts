export interface CoverGradient {
  id: string;
  label: string;
  value: string;
}

export const PROJECT_GRADIENTS: CoverGradient[] = [
  { id: 'blue',   label: 'Синий',    value: 'linear-gradient(135deg, #4F6EBD, #2A3E7A)' },
  { id: 'oak',    label: 'Дуб',      value: 'linear-gradient(135deg, #8C5E1E, #4A3616)' },
  { id: 'green',  label: 'Зелёный',  value: 'linear-gradient(135deg, #3F8C4A, #1F4A26)' },
  { id: 'amber',  label: 'Янтарь',   value: 'linear-gradient(135deg, #B87A14, #6B4600)' },
  { id: 'purple', label: 'Пурпур',   value: 'linear-gradient(135deg, #7B4FBD, #3E2A6A)' },
  { id: 'teal',   label: 'Бирюза',   value: 'linear-gradient(135deg, #1E8A8C, #0D4A4B)' },
  { id: 'rose',   label: 'Роза',     value: 'linear-gradient(135deg, #BD4F6E, #7A2A3E)' },
  { id: 'slate',  label: 'Графит',   value: 'linear-gradient(135deg, #3a5a7a, #1a2a3a)' },
];

export const DEFAULT_GRADIENT = PROJECT_GRADIENTS[7].value;

export function coverStyle(coverImage: string | null | undefined, coverGradient: string | null | undefined): React.CSSProperties {
  if (coverImage) {
    return {
      backgroundImage: `url(${coverImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { background: coverGradient || DEFAULT_GRADIENT };
}
