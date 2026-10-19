/**
 * Approved Treehouse palettes (light, Evening) and the Soft type pairing.
 * Light is the live app theme. Evening is approved and not applied yet.
 */

export type TreehousePalette = {
  readonly background: string;
  readonly surface: string;
  readonly primary: string;
  readonly accent: string;
  readonly monkey: string;
  readonly orange: string;
  readonly text: string;
  readonly success: string;
};

export const treehouseLight: TreehousePalette = {
  background: '#EFE4D8',
  surface: '#FBF6F0',
  primary: '#7A5340',
  accent: '#E0A15A',
  monkey: '#4E6A78',
  orange: '#E07030',
  text: '#2A211C',
  success: '#5C8A62',
};

/** Soft pairing, round 3. Titles use Nunito. Text uses Source Sans 3. */
export const treehouseType = {
  display: 'Nunito',
  body: 'Source Sans 3',
} as const;

/** Evening. Same monkey and orange washes as day. */
export const treehouseDark: TreehousePalette = {
  background: '#241C17',
  surface: '#322820',
  primary: '#E0B08A',
  accent: '#E0A15A',
  monkey: '#4E6A78',
  orange: '#E07030',
  text: '#F6EFE6',
  success: '#8FBF96',
};
