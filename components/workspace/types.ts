export type Planet = {
  id: string;
  name: string;
  kind: string;
  x: number;
  y: number;
  r: number;
  color: string;
  deps: string[];
  files: number;
  loc: string;
  desc: string;
};

export type DrawerType = null | "docs" | "chat" | "search" | "history";
