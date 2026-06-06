import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import LegalLayout from './LegalLayout';

const CONTACT = 'team@geosolver.bg';

const TermsOfService = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';

  const content = bg
    ? {
        title: 'Общи условия',
        updated: 'Последна актуализация: юни 2026 г.',
        intro:
          'Тези общи условия уреждат използването на платформата GeoSolver (geosolver.bg). С достъпа до услугата вие приемате тези условия.',
        sections: [
          {
            heading: 'Приемане на условията',
            body: 'Като създадете профил или използвате GeoSolver, вие се съгласявате с настоящите условия и с Политиката за поверителност.',
          },
          {
            heading: 'Описание на услугата',
            body: 'GeoSolver предоставя инструменти за геодезически изчисления, електронни карнети и функции за обучение (класна стая). Някои функции са в бета версия и може да се променят.',
          },
          {
            heading: 'Профили',
            body: 'Отговаряте за поверителността на данните за вход и за всички действия през вашия профил. Уведомете ни при съмнение за неоторизиран достъп.',
          },
          {
            heading: 'Приемливо ползване',
            body: [
              'Забранено е да използвате услугата за незаконни цели, да злоупотребявате с инфраструктурата, да опитвате неоторизиран достъп или да нарушавате правата на други потребители.',
            ],
          },
          {
            heading: 'Абонаменти и плащания',
            body: [
              'Платените планове се таксуват чрез Stripe на посочения период. Можете да управлявате или прекратите абонамента си по всяко време от профила си. Прекратяването спира бъдещи плащания; вече платени периоди не подлежат на пропорционално възстановяване, освен ако законът не изисква друго.',
            ],
          },
          {
            heading: 'Интелектуална собственост',
            body: 'Платформата, дизайнът и съдържанието са собственост на GeoSolver/Wortexa™. Запазвате правата върху данните, които въвеждате (изчисления, карнети).',
          },
          {
            heading: 'Бета функции и точност',
            body: [
              'Електронните карнети и някои изчисления са в бета версия и се предоставят „както са“. Резултатите са помощни — отговорност на потребителя е да провери изчисленията преди професионална употреба.',
            ],
          },
          {
            heading: 'Ограничаване на отговорността',
            body: 'В максималната допустима от закона степен GeoSolver не носи отговорност за непреки или последващи вреди, произтичащи от използването на услугата или от разчитане на резултати от изчисления.',
          },
          {
            heading: 'Прекратяване',
            body: 'Можем да ограничим или прекратим достъп при нарушение на тези условия. Можете да изтриете профила си по всяко време.',
          },
          {
            heading: 'Приложимо право',
            body: 'Тези условия се уреждат от законодателството на Република България. Споровете се решават от компетентните български съдилища.',
          },
          {
            heading: 'Контакт',
            body: `За въпроси относно тези условия: ${CONTACT}.`,
          },
        ],
      }
    : {
        title: 'Terms of Service',
        updated: 'Last updated: June 2026',
        intro:
          'These terms govern your use of the GeoSolver platform (geosolver.bg). By accessing the service you accept these terms.',
        sections: [
          {
            heading: 'Acceptance',
            body: 'By creating an account or using GeoSolver, you agree to these terms and to the Privacy Policy.',
          },
          {
            heading: 'Description of the service',
            body: 'GeoSolver provides geodetic calculation tools, electronic field books, and education features (classroom). Some features are in beta and may change.',
          },
          {
            heading: 'Accounts',
            body: 'You are responsible for keeping your credentials confidential and for all activity under your account. Notify us of any unauthorized access.',
          },
          {
            heading: 'Acceptable use',
            body: [
              'You may not use the service for unlawful purposes, abuse the infrastructure, attempt unauthorized access, or infringe other users\u2019 rights.',
            ],
          },
          {
            heading: 'Subscriptions and payments',
            body: [
              'Paid plans are billed via Stripe for the stated period. You can manage or cancel your subscription anytime from your account. Cancellation stops future charges; already-paid periods are non-refundable unless required by law.',
            ],
          },
          {
            heading: 'Intellectual property',
            body: 'The platform, design and content are owned by GeoSolver/Wortexa™. You retain rights to the data you enter (calculations, field books).',
          },
          {
            heading: 'Beta features and accuracy',
            body: [
              'Electronic field books and some calculations are in beta and provided "as is". Results are an aid \u2014 it is the user\u2019s responsibility to verify calculations before professional use.',
            ],
          },
          {
            heading: 'Limitation of liability',
            body: 'To the maximum extent permitted by law, GeoSolver is not liable for indirect or consequential damages arising from use of the service or reliance on calculation results.',
          },
          {
            heading: 'Termination',
            body: 'We may restrict or terminate access for breach of these terms. You may delete your account at any time.',
          },
          {
            heading: 'Governing law',
            body: 'These terms are governed by the laws of the Republic of Bulgaria. Disputes are resolved by the competent Bulgarian courts.',
          },
          {
            heading: 'Contact',
            body: `For questions about these terms: ${CONTACT}.`,
          },
        ],
      };

  return <LegalLayout {...content} canonical="/terms" />;
};

export default TermsOfService;
