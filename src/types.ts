export type Video = {
  title: string;
  id: string; // YouTube ID
  speed: typeof speeds[number];
  flag: number;
}

export type Data = Video[]

export const speeds = [.25, .50, .75, 1, 1.25, 1.50, 1.75, 2] as const
