export type Step = {
  id: string;
  label: string;
  detail: string;
  icon: any;
  duration: number; // ms
  logs: string[];
};

export type LogLine = {
  step: string;
  line: string;
  t: string;
};

export type Agent = {
  name: string;
  role: string;
  color: string;
};
