export type Locale = "es" | "en";

export interface Dictionary {
  nav: {
    analyze: string;
    compare: string;
    history: string;
    about: string;
  };
  hero: {
    title: string;
    description: string;
  };
  form: {
    placeholder: string;
    button: string;
    buttonLoading: string;
    errorEmpty: string;
    errorInvalid: string;
  };
  features: {
    structuredData: { title: string; description: string };
    identityConsistency: { title: string; description: string };
    authoritySignals: { title: string; description: string };
    technicalAccessibility: { title: string; description: string };
    quickTest: string;
  };
  progress: {
    steps: string[];
  };
  report: {
    evaluationByAxis: string;
    actionPlan: string;
    entityGraph: string;
    badge: string;
    copyJson: string;
    copied: string;
    share: string;
    summaryTitle: string;
    positive: string;
    warnings: string;
    critical: string;
  };
  axis: {
    structuredData: string;
    identityConsistency: string;
    authoritySignals: string;
    technicalAccessibility: string;
    pending: string;
    pendingMessage: string;
  };
  effort: {
    bajo: string;
    medio: string;
    alto: string;
  };
  maturity: {
    bajo: string;
    medio: string;
    alto: string;
    excelente: string;
  };
  history: {
    title: string;
    emptyTitle: string;
    emptyDescription: string;
    emptyButton: string;
    clearAll: string;
    repeat: string;
    delete: string;
  };
  compare: {
    title: string;
    siteA: string;
    siteB: string;
    button: string;
    buttonLoading: string;
    summaryTitle: string;
    same: string;
    equal: string;
    beatsBy: string;
    idleMessage: string;
    errorBothRequired: string;
    errorBothInvalid: string;
    errorSameUrl: string;
  };
  chat: {
    title: string;
    placeholder: string;
    emptyMessage: string;
    truncated: string;
  };
  cookies: {
    message: string;
    accept: string;
    reject: string;
  };
  footer: {
    product: string;
    info: string;
    analyzeLink: string;
    compareLink: string;
    historyLink: string;
    apiDocs: string;
    aboutLink: string;
    teamLink: string;
    copyrightLink: string;
    termsLink: string;
    repoLink: string;
    cookiePrefs: string;
    rights: string;
  };
  theme: {
    light: string;
    dark: string;
  };
  locale: {
    es: string;
    en: string;
  };
  errors: {
    INVALID_URL: string;
    FORBIDDEN_URL: string;
    SITE_UNREACHABLE: string;
    TIMEOUT: string;
    INTERNAL_ERROR: string;
    connectionError: string;
  };
  shareMenu: {
    copyLink: string;
    linkCopied: string;
    email: string;
    moreOptions: string;
  };
  pages: {
    about: PageAbout;
    team: PageTeam;
    copyright: PageCopyright;
    terms: PageTerms;
    history: PageHistory;
  };
}

export interface PageAbout {
  title: string;
  whatIs: string;
  whatIsDescription: string;
  audience: string;
  audienceDescription: string;
  problem: string;
  problemDescription: string;
  purpose: string;
  purposeDescription: string;
}

export interface PageTeam {
  title: string;
  intro: string;
  roleCarlos: string;
  roleMatias: string;
}

export interface PageCopyright {
  title: string;
  ownership: string;
  prohibition: string;
  disclaimer: string;
}

export interface PageTerms {
  title: string;
  intro: string;
  availabilityTitle: string;
  availabilityDescription: string;
  resultsTitle: string;
  resultsDescription: string;
  responsibilityTitle: string;
  responsibilityDescription: string;
  usageTitle: string;
  usageDescription: string;
  modificationsTitle: string;
  modificationsDescription: string;
  legalDisclaimer: string;
}

export interface PageHistory {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyButton: string;
  clearAll: string;
  repeat: string;
  exportJson: string;
  exportPdf: string;
  delete: string;
}
