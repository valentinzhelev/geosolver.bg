import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import LegalLayout from './LegalLayout';

const CONTACT = 'team@geosolver.bg';

const PrivacyPolicy = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';

  const content = bg
    ? {
        title: 'Политика за поверителност',
        updated: 'Последна актуализация: юни 2026 г.',
        intro:
          'Тази политика обяснява какви лични данни събира GeoSolver (geosolver.bg), как ги използваме и какви права имате съгласно Общия регламент за защита на данните (GDPR).',
        sections: [
          {
            heading: 'Кои сме ние',
            body: (
              <>
                GeoSolver е онлайн платформа за геодезически изчисления и обучение, разработвана и поддържана от екипа на{' '}
                <a
                  href="https://wortexa.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 text-neutral-800 dark:text-zinc-200"
                >
                  Wortexa
                </a>
                . За въпроси относно личните данни се свържете с нас на {CONTACT}.
              </>
            ),
          },
          {
            heading: 'Какви данни събираме',
            body: [
              '• Профил: име, имейл адрес и парола (съхранявана криптирано/хеширана).',
              '• Употреба: история на изчисленията, проекти и карнети, които създавате.',
              '• Образователни данни: при използване на класната стая — групи, задания и резултати на ученици.',
              '• Плащания: обработват се от Stripe. Ние не съхраняваме данни на банкови карти.',
              '• Технически: бисквитки и локално съхранение (вкл. токен за вход), IP адрес, тип браузър.',
            ],
          },
          {
            heading: 'Правно основание и цели',
            body: [
              'Обработваме данните, за да предоставяме услугата (изпълнение на договор), да поддерживаме сигурността, да обработваме абонаменти и да подобряваме продукта (легитимен интерес), както и при ваше съгласие (напр. бисквитки за анализ).',
            ],
          },
          {
            heading: 'Споделяне с трети страни',
            body: [
              'Споделяме данни само с доставчици, необходими за услугата: Stripe (плащания), Google (вход чрез Google и OCR за разпознаване на изображения), доставчик на имейл (нотификации), и Sentry (мониторинг на грешки). Всеки от тях обработва данните съгласно собствените си политики.',
            ],
          },
          {
            heading: 'Съхранение',
            body: 'Пазим данните, докато имате активен профил. След изтриване на профила данните се премахват или анонимизират в разумен срок, освен ако законът не изисква друго.',
          },
          {
            heading: 'Вашите права (GDPR)',
            body: [
              'Имате право на достъп, корекция, изтриване, ограничаване и преносимост на данните, както и право на възражение. За упражняване на тези права пишете на ' + CONTACT + '.',
            ],
          },
          {
            heading: 'Сигурност',
            body: 'Прилагаме технически и организационни мерки (криптирани пароли, HTTPS, ограничен достъп), за да защитим данните ви. Никой метод на пренос не е 100% сигурен.',
          },
          {
            heading: 'Бисквитки',
            body: 'Използваме необходими бисквитки/локално съхранение за вход и предпочитания. Можете да управлявате съгласието си чрез банера за бисквитки и настройките на браузъра.',
          },
          {
            heading: 'Промени',
            body: 'Може да актуализираме тази политика. Съществените промени ще бъдат отбелязани на тази страница с нова дата.',
          },
        ],
      }
    : {
        title: 'Privacy Policy',
        updated: 'Last updated: June 2026',
        intro:
          'This policy explains what personal data GeoSolver (geosolver.bg) collects, how we use it, and your rights under the General Data Protection Regulation (GDPR).',
        sections: [
          {
            heading: 'Who we are',
            body: (
              <>
                GeoSolver is an online platform for geodetic calculations and education, developed and maintained by the{' '}
                <a
                  href="https://wortexa.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 text-neutral-800 dark:text-zinc-200"
                >
                  Wortexa
                </a>{' '}
                team. For data questions contact us at {CONTACT}.
              </>
            ),
          },
          {
            heading: 'What we collect',
            body: [
              '• Account: name, email, and password (stored hashed/encrypted).',
              '• Usage: your calculation history, projects and field books.',
              '• Educational data: when using the classroom — groups, assignments and student results.',
              '• Payments: handled by Stripe. We do not store card details.',
              '• Technical: cookies and local storage (incl. auth token), IP address, browser type.',
            ],
          },
          {
            heading: 'Legal basis and purposes',
            body: [
              'We process data to provide the service (contract performance), maintain security, handle subscriptions, and improve the product (legitimate interest), and with your consent (e.g. analytics cookies).',
            ],
          },
          {
            heading: 'Third-party sharing',
            body: [
              'We share data only with providers required for the service: Stripe (payments), Google (Google sign-in and OCR image recognition), an email provider (notifications), and Sentry (error monitoring). Each processes data under its own policies.',
            ],
          },
          {
            heading: 'Retention',
            body: 'We retain data while your account is active. After account deletion, data is removed or anonymized within a reasonable period unless the law requires otherwise.',
          },
          {
            heading: 'Your rights (GDPR)',
            body: [
              'You have the right to access, rectify, erase, restrict and port your data, and to object. To exercise these rights, email ' + CONTACT + '.',
            ],
          },
          {
            heading: 'Security',
            body: 'We apply technical and organizational measures (hashed passwords, HTTPS, restricted access) to protect your data. No transmission method is 100% secure.',
          },
          {
            heading: 'Cookies',
            body: 'We use necessary cookies/local storage for login and preferences. You can manage consent via the cookie banner and your browser settings.',
          },
          {
            heading: 'Changes',
            body: 'We may update this policy. Material changes will be noted on this page with a new date.',
          },
        ],
      };

  return <LegalLayout {...content} canonical="/privacy-policy" />;
};

export default PrivacyPolicy;
