import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import LegalLayout from './LegalLayout';

const CONTACT = 'team@geosolver.bg';

const Disclaimer = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';

  const content = bg
    ? {
        title: 'Отказ от отговорност',
        updated: 'Последна актуализация: юни 2026 г.',
        intro:
          'GeoSolver предоставя инструменти за геодезически изчисления и обучение. Моля, прочетете внимателно ограниченията по-долу.',
        sections: [
          {
            heading: 'Образователна и помощна цел',
            body: 'Изчисленията и резултатите в GeoSolver са с образователна и помощна цел. Те не заместват професионалната преценка на правоспособен геодезист.',
          },
          {
            heading: 'Точност на резултатите',
            body: 'Стремим се към коректност на формулите и изчисленията, но не гарантираме безусловна точност. Потребителят е длъжен да провери резултатите преди използване в реални проекти.',
          },
          {
            heading: 'Бета функции',
            body: 'Електронните карнети и някои инструменти са в бета версия. Възможни са грешки, промени или прекъсвания.',
          },
          {
            heading: 'Отговорност',
            body: 'GeoSolver и Wortexa™ не носят отговорност за решения, действия или вреди, произтичащи от разчитане на резултати от платформата.',
          },
          {
            heading: 'Контакт',
            body: `При забелязана грешка в изчисленията ни уведомете на ${CONTACT}.`,
          },
        ],
      }
    : {
        title: 'Disclaimer',
        updated: 'Last updated: June 2026',
        intro:
          'GeoSolver provides geodetic calculation and education tools. Please read the limitations below carefully.',
        sections: [
          {
            heading: 'Educational and supporting purpose',
            body: 'Calculations and results in GeoSolver are for educational and supporting purposes. They do not replace the professional judgment of a licensed surveyor.',
          },
          {
            heading: 'Accuracy of results',
            body: 'We strive for correct formulas and calculations but do not guarantee unconditional accuracy. Users must verify results before use in real projects.',
          },
          {
            heading: 'Beta features',
            body: 'Electronic field books and some tools are in beta. Errors, changes or interruptions are possible.',
          },
          {
            heading: 'Liability',
            body: 'GeoSolver and Wortexa™ are not liable for decisions, actions or damages arising from reliance on results from the platform.',
          },
          {
            heading: 'Contact',
            body: `If you notice a calculation error, let us know at ${CONTACT}.`,
          },
        ],
      };

  return <LegalLayout {...content} canonical="/disclaimer" />;
};

export default Disclaimer;
