/**
 * Build left/right GAI callouts for the radial workspace layout.
 */
export function buildStudentGaiCallouts({
  bg,
  tool,
  gaiFeedback,
  gaiContext,
  gaiStudyHint,
  canOpenCalculator,
  hasSubmitted,
  gamification,
}) {
  const left = [];
  const right = [];

  if (!hasSubmitted) {
    if (canOpenCalculator) {
      left.push({
        key: 'calc',
        align: 'left',
        variant: 'default',
        icon: 'settings',
        title: bg ? 'Автоматични изчисления' : 'Automatic calculations',
        body: bg
          ? 'Отвори калкулатора — GAI следи междинните стъпки.'
          : 'Open the calculator — GAI tracks your method steps.',
      });
    }
    left.push({
      key: 'method',
      align: 'left',
      variant: 'default',
      icon: 'method',
      title: bg ? 'Надежден метод' : 'Reliable method',
      body: bg ? tool?.descBg : tool?.descEn,
    });
    right.push({
      key: 'accuracy',
      align: 'right',
      variant: 'ai',
      icon: 'target',
      title: bg ? 'Точност на един клик' : 'Accuracy one click away',
      body: bg
        ? 'Попълни полетата и предай — после GAI ще анализира грешките.'
        : 'Fill in the fields and submit — GAI will analyze errors after.',
    });
    if (gaiContext?.peerCount >= 3) {
      right.push({
        key: 'class-avg',
        align: 'right',
        variant: 'peer',
        icon: 'peer',
        title: bg ? 'Клас (анонимно)' : 'Class (anonymous)',
        body: bg
          ? `${gaiContext.peerCount} ученика · средно ${gaiContext.avgScore ?? '—'}%`
          : `${gaiContext.peerCount} students · avg ${gaiContext.avgScore ?? '—'}%`,
      });
    }
    if (gamification?.streak > 0) {
      right.push({
        key: 'streak',
        align: 'right',
        variant: 'success',
        icon: 'bolt',
        title: bg ? `Серия ${gamification.streak}` : `Streak ${gamification.streak}`,
        body: bg ? 'Продължавай да предаваш навреме!' : 'Keep submitting on time!',
      });
    }
    if (gaiStudyHint?.bg || gaiStudyHint?.en) {
      left.push({
        key: 'llm-hint',
        align: 'left',
        variant: 'ai',
        icon: 'gai',
        title: 'GAI',
        body: bg ? gaiStudyHint.bg : gaiStudyHint.en,
        long: true,
      });
    }
    return { left, right };
  }

  const llmText = gaiFeedback?.llmNarrative;
  if (llmText?.bg || llmText?.en) {
    right.push({
      key: 'llm-narrative',
      align: 'right',
      variant: 'ai',
      icon: 'gai',
      title: bg ? 'GAI обяснение' : 'GAI explanation',
      body: bg ? llmText.bg : llmText.en,
      long: true,
    });
  } else {
    right.push({
      key: 'gai-headline',
      align: 'right',
      variant: 'ai',
      icon: 'gai',
      title: 'GAI',
      body: bg ? gaiFeedback?.headline?.bg : gaiFeedback?.headline?.en,
    });
  }

  (gaiFeedback?.fields || []).forEach((f, i) => {
    const side = i % 2 === 0 ? left : right;
    side.push({
      key: `field-${f.key}`,
      align: side === left ? 'left' : 'right',
      variant: f.status === 'correct' ? 'success' : f.status === 'close' ? 'warn' : 'ai',
      icon: f.status === 'correct' ? 'check' : 'warn',
      title: bg ? f.label?.bg : f.label?.en,
      body: bg ? f.message?.bg : f.message?.en,
    });
  });

  (gaiFeedback?.classComparisons || []).forEach((c) => {
    left.push({
      key: `peer-${c.key}`,
      align: 'left',
      variant: 'peer',
      icon: 'peer',
      title: bg ? 'Сравнение с класа' : 'Class comparison',
      body: bg ? c.message?.bg : c.message?.en,
    });
  });

  return { left, right };
}

export function buildTeacherGaiCallouts({ bg, gaiInsights, llmNarrative }) {
  const left = [];
  const right = [];

  if (!gaiInsights) return { left, right };

  if (llmNarrative?.bg || llmNarrative?.en) {
    right.push({
      key: 'llm-teacher',
      align: 'right',
      variant: 'ai',
      icon: 'gai',
      title: bg ? 'GAI анализ' : 'GAI analysis',
      body: bg ? llmNarrative.bg : llmNarrative.en,
      long: true,
    });
  }

  left.push({
    key: 'summary',
    align: 'left',
    variant: 'ai',
    icon: 'gai',
    title: bg ? gaiInsights.summary?.headline?.bg : gaiInsights.summary?.headline?.en,
    body:
      gaiInsights.summary?.score != null
        ? `${Math.round(gaiInsights.summary.score)}% · ${gaiInsights.summary.correctCount}/${gaiInsights.summary.totalFields}`
        : '',
  });

  (gaiInsights.fieldInsights || []).forEach((f, i) => {
    const side = i % 2 === 0 ? right : left;
    side.push({
      key: f.key,
      align: side === left ? 'left' : 'right',
      variant: f.isCorrect ? 'success' : 'warn',
      icon: f.isCorrect ? 'check' : 'warn',
      title: `${bg ? f.label?.bg : f.label?.en}: ${f.studentValue}`,
      body: bg ? f.diagnosis?.bg : f.diagnosis?.en,
    });
  });

  (gaiInsights.recommendations || []).slice(0, 2).forEach((r, i) => {
    (i === 0 ? left : right).push({
      key: `rec-${i}`,
      align: i === 0 ? 'left' : 'right',
      variant: 'ai',
      icon: 'tip',
      title: bg ? 'Препоръка' : 'Tip',
      body: bg ? r.bg : r.en,
    });
  });

  return { left, right };
}
