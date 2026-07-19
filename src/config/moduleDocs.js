/**
 * Educational content for workspace modules (BG + EN).
 * GeoSolver modules are documented workflows — theory + practice, not quick-only tools.
 */

/** Badge on module pages — professional label (not “school module”). */
export const MODULE_BADGE_LABEL = {
  bg: 'Документация и практика',
  en: 'Documentation & practice',
};

export function getModuleBadgeLabel(language = 'bg') {
  return MODULE_BADGE_LABEL[language === 'bg' ? 'bg' : 'en'];
}

export const MODULE_META = {
  projects: {
    path: '/projects',
    title: { bg: 'Проектен hub', en: 'Project hub' },
    subtitle: {
      bg: 'Обектът е „контейнер“ за точки, карнети и карта — както в реална геодезическа практика и в учебна работа.',
      en: 'A site is a container for points, field books and map — as in real survey practice and coursework.',
    },
    seo: {
      bg: 'Управление на геодезически обекти, точки и карнети',
      en: 'Manage survey sites, points and field books',
    },
  },
  points: {
    path: '/points',
    title: { bg: 'Библиотека с точки', en: 'Points library' },
    subtitle: {
      bg: 'Централно хранилище на геодезически точки — преизползвай ги в калкулаторите, картата и трасирането.',
      en: 'Central store for survey points — reuse them in calculators, map and stake-out.',
    },
    seo: {
      bg: 'Библиотека с координати Y, X, H за геодезически проекти',
      en: 'Coordinate library Y, X, H for survey projects',
    },
  },
  map: {
    path: '/map',
    title: { bg: 'Координатна карта', en: 'Coordinate map' },
    subtitle: {
      bg: '2D план, височинен профил и 3D preview — визуализация на пространственото разположение на точките.',
      en: '2D plan, elevation profile and 3D preview — visualize point layout in space.',
    },
    seo: {
      bg: '2D карта, профил и 3D preview на геодезически точки',
      en: '2D map, profile and 3D preview of survey points',
    },
  },
  gnss: {
    path: '/gnss',
    title: { bg: 'GNSS import', en: 'GNSS import' },
    subtitle: {
      bg: 'Внасяне на измервания от приемник (CSV, GPX, RINEX) в библиотеката — първа стъпка към карта и анализ.',
      en: 'Bring receiver data (CSV, GPX, RINEX) into the library — first step toward map and analysis.',
    },
    seo: {
      bg: 'Import на GNSS точки от CSV, GPX и RINEX',
      en: 'Import GNSS points from CSV, GPX and RINEX',
    },
  },
  stakeout: {
    path: '/stakeout',
    title: { bg: 'Трасиране (stake-out)', en: 'Stake-out' },
    subtitle: {
      bg: 'От станция към проектна точка: посочен ъгъл α и разстояние S — втора основна задача на терен.',
      en: 'From station to design point: bearing α and distance S — second basic task in the field.',
    },
    seo: {
      bg: 'Офисно и теренно трасиране по координати',
      en: 'Office and field stake-out from coordinates',
    },
  },
  fieldbook: {
    path: '/fieldbook',
    title: { bg: 'Полеви карнети', en: 'Field books' },
    subtitle: {
      bg: 'Нивелационен и координатен карнет с автоматични изчисления — теренна практика и контрол на грешки.',
      en: 'Leveling and coordinate field books with automatic calculations — field practice and error control.',
    },
    seo: {
      bg: 'Нивелационен и координатен полеви карнет',
      en: 'Leveling and coordinate field book',
    },
  },
};

export function getModuleDocs(moduleId, language = 'bg') {
  const bg = language === 'bg';
  const docs = MODULE_DOCS[moduleId];
  if (!docs) return null;
  return {
    workflow: docs.workflow.map((s) => ({ title: s.title[bg ? 'bg' : 'en'], body: s.body[bg ? 'bg' : 'en'] })),
    sections: docs.sections.map((sec) => ({
      title: sec.title[bg ? 'bg' : 'en'],
      content: sec.content?.[bg ? 'bg' : 'en'],
      variant: sec.variant,
      list: sec.list?.[bg ? 'bg' : 'en'],
      table: sec.table
        ? { headers: sec.table.headers[bg ? 'bg' : 'en'], rows: sec.table.rows[bg ? 'bg' : 'en'] }
        : null,
    })),
    quickTips: docs.quickTips[bg ? 'bg' : 'en'],
    relatedTools: docs.relatedTools.map((r) => ({
      to: r.to,
      label: r.label[bg ? 'bg' : 'en'],
    })),
  };
}

const MODULE_DOCS = {
  projects: {
    workflow: [
      {
        title: { bg: '1. Създай обект', en: '1. Create a site' },
        body: { bg: 'В карнетите или при import задай име, година и екип.', en: 'In field books or on import set name, year and team.' },
      },
      {
        title: { bg: '2. Събери точки', en: '2. Collect points' },
        body: { bg: 'GNSS import, ръчно въвеждане или координатен карнет.', en: 'GNSS import, manual entry or coordinate field book.' },
      },
      {
        title: { bg: '3. Провери на карта', en: '3. Check on map' },
        body: { bg: '2D план + профил — виж дали геометрията е логична.', en: '2D plan + profile — verify geometry makes sense.' },
      },
      {
        title: { bg: '4. Отчет', en: '4. Report' },
        body: { bg: 'Клиентски PDF с обобщение на точките и обекта.', en: 'Client PDF summarizing points and the site.' },
      },
    ],
    quickTips: {
      bg: [
        'Обектът не е кадастрална партида — това е учебен/работен контейнер в GeoSolver.',
        'Един обект може да има много карнети (различни дни на измерване).',
        'Филтрирай точките по проект преди трасиране.',
      ],
      en: [
        'A site is not a cadastral parcel — it is a learning/work container in GeoSolver.',
        'One site can have many field books (different survey days).',
        'Filter points by project before stake-out.',
      ],
    },
    relatedTools: [
      { to: '/fieldbook', label: { bg: 'Полеви карнети', en: 'Field books' } },
      { to: '/points', label: { bg: 'Библиотека с точки', en: 'Points library' } },
      { to: '/map', label: { bg: 'Координатна карта', en: 'Coordinate map' } },
    ],
    sections: [
      {
        title: { bg: 'Какво е „обект“ в GeoSolver?', en: 'What is a “site” in GeoSolver?' },
        content: {
          bg: 'В професионалната геодезия един обект (строителен, кадастрален, инженерен) обединява измерванията, точките и документацията. В GeoSolver проектният hub прави същото за учебни и теренни задачи: виждаш колко точки и карнета имаш, и преминаваш към карта, трасиране или PDF отчет.',
          en: 'In professional surveying, a site (construction, cadastral, engineering) bundles measurements, points and documentation. GeoSolver’s project hub does the same for coursework and field work: see point and field book counts, then open map, stake-out or a PDF report.',
        },
      },
      {
        title: { bg: 'Връзка с учебната програма', en: 'Link to the curriculum' },
        variant: 'green',
        list: {
          bg: [
            'Практика „от терен до план“ — събиране → проверка → отчет.',
            'Подходящо за курсови работи и дипломни обекти с екип и година.',
            'Комбинирай с класната стая за предаване на резултати.',
          ],
          en: [
            '“Field to plan” practice — collect → verify → report.',
            'Suitable for coursework and thesis sites with team and year.',
            'Combine with the classroom for submitting results.',
          ],
        },
      },
      {
        title: { bg: 'Клиентски PDF', en: 'Client PDF' },
        content: {
          bg: 'Отчетът включва метаданни на обекта, брой точки с координати, таблица (до 80 точки) и дата на генериране. Подходящ за демонстрация пред преподавател или възложител — не замества официален кадастрален документ.',
          en: 'The report includes site metadata, count of points with coordinates, a table (up to 80 points) and generation date. Suitable to show a teacher or client — not a substitute for official cadastral documents.',
        },
      },
    ],
  },

  points: {
    workflow: [
      { title: { bg: '1. Добави точка', en: '1. Add a point' }, body: { bg: 'Име, код, Y, X, H (по избор).', en: 'Name, code, Y, X, H (optional).' } },
      { title: { bg: '2. Клас и слой', en: '2. Class and layer' }, body: { bg: 'Контролна, детайл, ограда — за филтриране на картата.', en: 'Control, detail, fence — for map filtering.' } },
      { title: { bg: '3. Преизползвай', en: '3. Reuse' }, body: { bg: 'PointPicker в калкулаторите и stake-out.', en: 'PointPicker in calculators and stake-out.' } },
      { title: { bg: '4. Export', en: '4. Export' }, body: { bg: 'CSV за архив или друг софтуер.', en: 'CSV for archive or other software.' } },
    ],
    quickTips: {
      bg: [
        'Y е север (Northing), X е изток (Easting) — българска координатна конвенция.',
        'Търсенето работи по име и код с кратко забавяне.',
        'CSV import: име, код, Y, X, H, бележки (ред на колоните).',
      ],
      en: [
        'Y is north (Northing), X is east (Easting) — Bulgarian coordinate convention.',
        'Search matches name and code with a short debounce.',
        'CSV import: name, code, Y, X, H, notes (column order).',
      ],
    },
    relatedTools: [
      { to: '/second-task/docs', label: { bg: 'Втора основна задача', en: 'Second basic task' } },
      { to: '/gnss', label: { bg: 'GNSS import', en: 'GNSS import' } },
      { to: '/map', label: { bg: 'Карта', en: 'Map' } },
    ],
    sections: [
      {
        title: { bg: 'Координатна система', en: 'Coordinate system' },
        content: {
          bg: 'GeoSolver работи в плоска координатна система с метри. Y сочи към север, X към изток. Котата H е над морското равнище (или относителна, ако така е дефинирана в обекта). При учебни задачи винаги проверявай дали Y и X не са разменени — това е най-честата грешка на студенти.',
          en: 'GeoSolver uses a plane coordinate system in metres. Y points north, X points east. Elevation H is above sea level (or relative, as defined for the site). In coursework always check Y and X are not swapped — the most common student mistake.',
        },
      },
      {
        title: { bg: 'Полета на точката', en: 'Point fields' },
        table: {
          headers: { bg: ['Поле', 'Значение'], en: ['Field', 'Meaning'] },
          rows: {
            bg: [
              ['Име *', 'Уникален идентификатор в обекта'],
              ['Код', 'Кратък код от терена (TP1, K3…)'],
              ['Y, X', 'Планови координати в метри'],
              ['H', 'Кота — за профил и 3D'],
              ['Клас', 'контролна / детайл / временна'],
              ['Слой', 'Група за филтър на картата'],
            ],
            en: [
              ['Name *', 'Unique ID within the site'],
              ['Code', 'Short field code (TP1, K3…)'],
              ['Y, X', 'Plan coordinates in metres'],
              ['H', 'Elevation — for profile and 3D'],
              ['Class', 'control / detail / temporary'],
              ['Layer', 'Group for map filter'],
            ],
          },
        },
      },
      {
        title: { bg: 'Учебна проверка', en: 'Learning check' },
        variant: 'yellow',
        list: {
          bg: [
            'След import от GNSS — отвори картата и виж дали точките образуват очаквана форма.',
            'Използвай втора основна задача между две точки от библиотеката.',
            'Сравни ΔY, ΔX с ръчно изчисление в научния калкулатор.',
          ],
          en: [
            'After GNSS import — open the map and check points form the expected shape.',
            'Use the second basic task between two library points.',
            'Compare ΔY, ΔX with hand calculation in the scientific calculator.',
          ],
        },
      },
    ],
  },

  map: {
    workflow: [
      { title: { bg: '1. Избери проект', en: '1. Pick project' }, body: { bg: 'Филтрирай точките на обекта.', en: 'Filter points for the site.' } },
      { title: { bg: '2. План', en: '2. Plan' }, body: { bg: 'Zoom, pan, линийка, scale bar.', en: 'Zoom, pan, ruler, scale bar.' } },
      { title: { bg: '3. OSM', en: '3. OSM' }, body: { bg: 'Подложка за GNSS/WGS84 точки.', en: 'Basemap for GNSS/WGS84 points.' } },
      { title: { bg: '4. Профил', en: '4. Profile' }, body: { bg: 'Chainage vs H — нужни ≥2 точки с кота.', en: 'Chainage vs H — need ≥2 points with H.' } },
      { title: { bg: '5. 3D', en: '5. 3D' }, body: { bg: 'Изометрия X, Y, H.', en: 'Isometric X, Y, H.' } },
    ],
    quickTips: {
      bg: [
        'На плана Y↑ е север — линийката мери S между две точки.',
        'OSM табът е само за GNSS/WGS84 (не BGS2005 план).',
        '3D preview е ориентировъчен, не замества CAD.',
      ],
      en: [
        'On the plan Y↑ is north — ruler measures S between two points.',
        'OSM tab is for GNSS/WGS84 only (not BGS2005 plan).',
        '3D preview is indicative, not a CAD replacement.',
      ],
    },
    relatedTools: [
      { to: '/points', label: { bg: 'Точки', en: 'Points' } },
      { to: '/area-calculation/docs', label: { bg: 'Площ', en: 'Area' } },
      { to: '/distance-bearing', label: { bg: 'Разстояние и ъгъл', en: 'Distance & bearing' } },
    ],
    sections: [
      {
        title: { bg: 'Три изгледа — една цел', en: 'Three views — one goal' },
        content: {
          bg: 'Планът показва хоризонтално разположение (като чертеж). Профилът свързва разстояние по трасето с котата — важен при пътища, канали и нивелация. 3D preview помага на студентите да „видят“ пространството, когато нямат CAD. Всеки изглед изисква координати Y и X; профил и 3D използват и H.',
          en: 'The plan shows horizontal layout (like a drawing). The profile links distance along a route to elevation — important for roads, channels and leveling. 3D preview helps students “see” space without CAD. Each view needs Y and X; profile and 3D also use H.',
        },
      },
      {
        title: { bg: 'Слоеве (layers)', en: 'Layers' },
        content: {
          bg: 'Слойът идва от полето layer на всяка точка. Филтрирай, за да виждаш само контролни или само детайлни точки — полезно при големи обекти и при защита на курсов проект.',
          en: 'Layer comes from each point’s layer field. Filter to show only control or only detail points — useful on large sites and when presenting coursework.',
        },
      },
      {
        title: { bg: 'Ограничения (учебно)', en: 'Limitations (educational)' },
        variant: 'yellow',
        list: {
          bg: [
            'OSM подложка е само за GNSS/WGS84 точки — BGS2005 остава на План.',
            'Профилът не е изравнителен профил по оста — следва ред на точките.',
            'За официални чертежи използвай CAD/GIS след export CSV.',
          ],
          en: [
            'OSM basemap is GNSS/WGS84 only — BGS2005 stays on Plan.',
            'Profile is not a designed vertical alignment — follows point order.',
            'For official drawings use CAD/GIS after CSV export.',
          ],
        },
      },
    ],
  },

  gnss: {
    workflow: [
      { title: { bg: '1. Запис на терен', en: '1. Field record' }, body: { bg: 'Export от приемник или софтуер.', en: 'Export from receiver or software.' } },
      { title: { bg: '2. Preview', en: '2. Preview' }, body: { bg: 'Провери таблицата преди import.', en: 'Check the table before import.' } },
      { title: { bg: '3. Проект', en: '3. Project' }, body: { bg: 'Свържи с обект (по избор).', en: 'Link to a site (optional).' } },
      { title: { bg: '4. Карта', en: '4. Map' }, body: { bg: 'Визуална проверка след import.', en: 'Visual check after import.' } },
    ],
    quickTips: {
      bg: [
        'CSV: разделител , или ; — колони име, Y, X, H.',
        'GPX: waypoints от туристически/GNSS приложения.',
        'RINEX .obs: само APPROX POSITION от header (учебно).',
      ],
      en: [
        'CSV: delimiter , or ; — columns name, Y, X, H.',
        'GPX: waypoints from hiking/GNSS apps.',
        'RINEX .obs: APPROX POSITION from header only (educational).',
      ],
    },
    relatedTools: [
      { to: '/gnss/live', label: { bg: 'NMEA live', en: 'NMEA live' } },
      { to: '/gnss/field-log', label: { bg: 'Полеви дневник', en: 'Field log' } },
      { to: '/gnss/post-process', label: { bg: 'Post-processing', en: 'Post-processing' } },
      { to: '/points', label: { bg: 'Библиотека с точки', en: 'Points library' } },
      { to: '/map', label: { bg: 'Карта', en: 'Map' } },
      { to: '/coordinate-transformation/docs', label: { bg: 'Трансформация', en: 'Transformation' } },
    ],
    sections: [
      {
        title: { bg: 'Поддържани формати', en: 'Supported formats' },
        table: {
          headers: { bg: ['Формат', 'Какво внасяме', 'Учебна бележка'], en: ['Format', 'What we import', 'Learning note'] },
          rows: {
            bg: [
              ['CSV / TXT', 'Име + Y, X, H', 'Най-чест при export от Excel или тотална станция'],
              ['GPX', 'Waypoints', 'Удобно от мобилни GNSS приложения'],
              ['RINEX .obs', 'APPROX POSITION XYZ', 'Запознай се с header-а — не пълна обработка'],
            ],
            en: [
              ['CSV / TXT', 'Name + Y, X, H', 'Common from Excel or total station export'],
              ['GPX', 'Waypoints', 'Handy from mobile GNSS apps'],
              ['RINEX .obs', 'APPROX POSITION XYZ', 'Learn the header — not full processing'],
            ],
          },
        },
      },
      {
        title: { bg: 'GNSS в учебен контекст', en: 'GNSS in learning context' },
        content: {
          bg: 'GNSS (GPS/Galileo/BeiDou) дава координати в глобална или локална система. Преди да ползваш точките в засечки, провери системата и елипсоида. GeoSolver приема готови Y, X, H — трансформацията е отделен модул. На терен: фиксирай тип точка (контролна/детайл) още при import чрез бележки.',
          en: 'GNSS (GPS/Galileo/BeiDou) yields coordinates in a global or local system. Before using points in intersections, check the system and ellipsoid. GeoSolver expects ready Y, X, H — transformation is a separate module. In the field: mark point type (control/detail) at import via notes.',
        },
      },
      {
        title: { bg: 'RINEX — какво четем', en: 'RINEX — what we read' },
        variant: 'blue',
        content: {
          bg: 'От observation файла извличаме маркер, версия, APPROX POSITION XYZ и време на първо измерване. Това е типична първа стъпка при обработка на базова станция — пълният RTK/PPK pipeline е тема за напреднали курсове.',
          en: 'From the observation file we extract marker, version, APPROX POSITION XYZ and time of first obs. This is a typical first step in base-station processing — full RTK/PPK pipeline is for advanced courses.',
        },
      },
    ],
  },

  stakeout: {
    workflow: [
      { title: { bg: '1. Станция', en: '1. Station' }, body: { bg: 'Текуща позиция (Y, X) — от приемник или точка.', en: 'Current position (Y, X) — from receiver or point.' } },
      { title: { bg: '2. Цел', en: '2. Target' }, body: { bg: 'Проектна точка от библиотеката.', en: 'Design point from the library.' } },
      { title: { bg: '3. α и S', en: '3. α and S' }, body: { bg: 'Втора основна задача — посочен ъгъл и разстояние.', en: 'Second basic task — bearing and distance.' } },
      { title: { bg: '4. Терен', en: '4. Field' }, body: { bg: 'Насочи тахиметъра/веха по α, измери S.', en: 'Sight total station/stake by α, measure S.' } },
    ],
    quickTips: {
      bg: [
        'α е в гради (0–400 gon), 0 gon ≈ север (+Y).',
        'Допускът е за учебно сравнение — не замества RTK.',
        'ΔY и ΔX трябва да съвпадат с втора основна задача.',
      ],
      en: [
        'α is in gon (0–400), 0 gon ≈ north (+Y).',
        'Tolerance is for learning comparison — not RTK.',
        'ΔY and ΔX should match the second basic task.',
      ],
    },
    relatedTools: [
      { to: '/gnss/live', label: { bg: 'NMEA live', en: 'NMEA live' } },
      { to: '/second-task', label: { bg: 'Втора основна задача', en: 'Second basic task' } },
      { to: '/distance-bearing/docs', label: { bg: 'Документация ΔY, ΔX', en: 'ΔY, ΔX documentation' } },
      { to: '/points', label: { bg: 'Точки', en: 'Points' } },
    ],
    sections: [
      {
        title: { bg: 'Теория: втора основна задача', en: 'Theory: second basic task' },
        content: {
          bg: 'Трасирането използва същата математика като втора основна задача: от станция (Y₁, X₁) към цел (Y₂, X₂) се намират ΔY, ΔX, разстояние S и посочен ъгъл α. На терен поставяш инструмента на станцията, насочваш по α и трасираш на разстояние S.',
          en: 'Stake-out uses the same math as the second basic task: from station (Y₁, X₁) to target (Y₂, X₂) you get ΔY, ΔX, distance S and bearing α. In the field you set up on the station, sight along α and stake at distance S.',
        },
      },
      {
        title: { bg: 'Формули (справка)', en: 'Formulas (reference)' },
        table: {
          headers: { bg: ['Величина', 'Формула'], en: ['Quantity', 'Formula'] },
          rows: {
            bg: [
              ['ΔY', 'Y₂ − Y₁'],
              ['ΔX', 'X₂ − X₁'],
              ['S', '√(ΔY² + ΔX²)'],
              ['α', 'atan2(ΔY, ΔX) в gon'],
            ],
            en: [
              ['ΔY', 'Y₂ − Y₁'],
              ['ΔX', 'X₂ − X₁'],
              ['S', '√(ΔY² + ΔX²)'],
              ['α', 'atan2(ΔY, ΔX) in gon'],
            ],
          },
        },
      },
      {
        title: { bg: 'Учебна процедура на терен', en: 'Field procedure for students' },
        variant: 'green',
        list: {
          bg: [
            'Забий временна точка на станцията и запиши нейните координати.',
            'Избери проектна точка от библиотеката като цел.',
            'Запиши α и S в полевия дневник.',
            'След трасиране измери обратно (check) — сравни с допуска.',
          ],
          en: [
            'Stake a temporary point at the station and record its coordinates.',
            'Pick a design point from the library as target.',
            'Record α and S in the field log.',
            'After staking measure back (check) — compare to tolerance.',
          ],
        },
      },
    ],
  },

  fieldbook: {
    workflow: [
      { title: { bg: '1. Проект', en: '1. Project' }, body: { bg: 'Избери или създай обект.', en: 'Select or create a site.' } },
      { title: { bg: '2. Карнет', en: '2. Field book' }, body: { bg: 'Нивелационен или координатен.', en: 'Leveling or coordinate.' } },
      { title: { bg: '3. Редове', en: '3. Rows' }, body: { bg: 'Теренни отчетания с автоматични коти.', en: 'Field readings with auto elevations.' } },
      { title: { bg: '4. Export', en: '4. Export' }, body: { bg: 'PDF, CSV или → Точки.', en: 'PDF, CSV or → Points.' } },
    ],
    quickTips: {
      bg: [
        'Нивелационният карнет използва редът за изчисление на превишения.',
        'Координатният карнет може да стартира от шаблон (трасé, сграда, нивелационен ход).',
        'Проверявай предупрежденията (tolerance) преди предаване.',
      ],
      en: [
        'Leveling field book uses row order for elevation computation.',
        'Coordinate field book can start from a template (traverse, building, leveling run).',
        'Check warnings (tolerance) before submission.',
      ],
    },
    relatedTools: [
      { to: '/projects', label: { bg: 'Проекти', en: 'Projects' } },
      { to: '/points', label: { bg: 'Точки', en: 'Points' } },
      { to: '/first-task/docs', label: { bg: 'Първа основна задача', en: 'First basic task' } },
    ],
    sections: [
      {
        title: { bg: 'Два типа карнети', en: 'Two field book types' },
        table: {
          headers: { bg: ['Тип', 'Приложение', 'Какво учиш'], en: ['Type', 'Use', 'What you learn'] },
          rows: {
            bg: [
              ['Нивелационен', 'Превишения, коти', 'Последователност от отчетания, затваряне на ход'],
              ['Координатен', 'Y, X от ъгъл и S', 'Полярен метод, натрупване на точки'],
            ],
            en: [
              ['Leveling', 'Elevations, heights', 'Reading sequence, loop closure'],
              ['Coordinate', 'Y, X from angle and S', 'Polar method, accumulating points'],
            ],
          },
        },
      },
      {
        title: { bg: 'Защо карнет в GeoSolver?', en: 'Why a field book in GeoSolver?' },
        content: {
          bg: 'Традиционният карнет учи дисциплина: ред на отчетанията, ясни кодове, проверка на грешки. Дигиталният вариант запазва същата логика, но добавя автоматични изчисления и export — мост между учебник и терен.',
          en: 'A traditional field book teaches discipline: reading order, clear codes, error checks. The digital version keeps that logic but adds automatic calculations and export — a bridge between textbook and field.',
        },
      },
      {
        title: { bg: 'Контрол на качеството', en: 'Quality control' },
        variant: 'yellow',
        list: {
          bg: [
            'Сравни крайната кота с независимо измерване.',
            'При координатен карнет — провери последната точка с втора основна задача.',
            'PDF export — за приложение към курсова работа.',
          ],
          en: [
            'Compare final elevation with an independent measurement.',
            'For coordinate field book — check last point with second basic task.',
            'PDF export — appendix for coursework.',
          ],
        },
      },
    ],
  },
};
