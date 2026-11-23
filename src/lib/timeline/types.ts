export type TimelineEvent = {
  id: string;
  title: string;
  year: number;
  weight: 1 | 2 | 3;
  description?: string;
  tags?: string[];
  image?: string;
};

export type TimelineEra = {
  id: string;
  title: string;
  start: number;
  end: number;
  description?: string;
  tags?: string[];
  image?: string;
};

export type SelectedItem = { type: 'event'; id: string } | { type: 'era'; id: string } | null;

export type TimelineTheme = {
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  axis: string;
  grid: string;
  event1: string;
  event2: string;
  event3: string;
  era1: string;
  era2: string;
  era3: string;
  era4: string;
  era5: string;
  era6: string;
  era7: string;
  era8: string;
  era9: string;
  era10: string;
  era11: string;
  era12: string;
  selection: string;
  selectionForeground: string;
};
