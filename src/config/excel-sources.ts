export const EXCEL_SOURCES = {
  sample: {
    file: "FAANG_DSA_Master_Roadmap_v2_sample.xlsx",
    label: "Sample roadmap",
  },
  full: {
    file: "FAANG_DSA_Master_Roadmap_v2.xlsx",
    label: "Full 70-day roadmap",
  },
} as const;

export type ExcelSourceKey = keyof typeof EXCEL_SOURCES;
