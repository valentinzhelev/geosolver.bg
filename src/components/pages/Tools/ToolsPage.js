import React from "react";
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { Link } from "react-router-dom";
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../auth/AuthContext';
import { useFieldBookPilotAccess } from '../../../hooks/useFieldBookPilotAccess';
import { getWorkspaceTools } from '../../../config/workspaceTools';
import WorkspaceToolsBar from './WorkspaceToolsBar';

const ToolsPage = () => {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const { isLoggedIn: showFieldBooks } = useFieldBookPilotAccess();
  const workspaceTools = getWorkspaceTools({ language, showFieldBooks });

  const tools = [
    {
      title: language === 'bg' ? "Първа основна задача" : "First Basic Task",
      description: language === 'bg' 
        ? "Изчисляване на координати по начална точка, ъгъл и дължина."
        : "Calculate coordinates using initial point, angle, and distance.",
      parameters: language === 'bg' ? "1 точка, ъгъл, дължина" : "1 point, angle, distance",
      type: language === 'bg' ? "Трансформация / полярен метод" : "Transformation / polar method",
      calculation: "< 0.05s",
      route: "/first-task",
      docsRoute: "/first-task/docs",
      icon: "/icons/first_task_icon.svg"
    },
    {
      title: language === 'bg' ? "Втора основна задача" : "Second Basic Task",
      description: language === 'bg'
        ? "Изчисляване на ъгъл и разстояние между две точки по координати."
        : "Calculate angle and distance between two points using coordinates.",
      parameters: language === 'bg' ? "4 входни координати" : "4 input coordinates",
      type: language === 'bg' ? "GNSS / координатна геодезия" : "GNSS / coordinate geodesy",
      calculation: "< 0.1s",
      route: "/second-task",
      docsRoute: "/second-task/docs",
      icon: "/icons/second_task_icon.svg"    
    },
    {
      title: language === 'bg' ? "Права засечка" : "Forward Intersection",
      description: language === 'bg'
        ? "Координати чрез посока и разстояние от известна точка."
        : "Coordinates through direction and distance from a known point.",
      parameters: language === 'bg' ? "1 известна точка + мерки" : "1 known point + measurements",
      type: language === 'bg' ? "GNSS / тахиметрично измерване" : "GNSS / tacheometric measurement",
      calculation: "< 0.08s",
      route: "/forward-intersection",
      docsRoute: "/forward-intersection/docs",
      icon: "/icons/forward_intersection_icon.svg"
    },
    {
      title: language === 'bg' ? "Обратна засечка" : "Resection",
      description: language === 'bg'
        ? "Определяне на позиция по ъгли от известни точки."
        : "Determine position using angles from known points.",
      parameters: language === 'bg' ? "2–3 известни точки и ъгли" : "2–3 known points and angles",
      type: language === 'bg' ? "координатна геодезия / класика" : "coordinate geodesy / classic",
      calculation: "~ 0.1s",
      route: "/resection",
      docsRoute: "/resection/docs",
      icon: "/icons/resection_icon.svg"
    },
    {
      title: language === 'bg' ? "Полярна засечка" : "Polar Intersection",
      description: language === 'bg'
        ? "Координати на точка по ъгъл и разстояние от известна точка."
        : "Point coordinates from angle and distance from a known point.",
      parameters: language === 'bg' ? "1 точка + ъгъл + S" : "1 point + angle + S",
      type: language === 'bg' ? "полярен метод" : "polar method",
      calculation: "< 0.08s",
      route: "/polar-intersection",
      docsRoute: "/polar-intersection/docs",
      icon: "/icons/polar_intersection_icon.svg"
    },
    {
      title: language === 'bg' ? "Задача на Хансен" : "Hansen Task",
      description: language === 'bg'
        ? "Определяне на неизвестна точка по две известни и ъгли."
        : "Determine unknown point from two known points and angles.",
      parameters: language === 'bg' ? "2 точки + 2 ъгъла" : "2 points + 2 angles",
      type: language === 'bg' ? "засечка / класика" : "intersection / classic",
      calculation: "~ 0.1s",
      route: "/hansen-task",
      docsRoute: "/hansen-task/docs",
      icon: "/icons/hansen-task-icon.svg"
    },
    {
      title: language === 'bg' ? "Координатна трансформация" : "Coordinate Transformation",
      description: language === 'bg'
        ? "Преобразуване между координатни системи (Helmert)."
        : "Transform between coordinate systems (Helmert).",
      parameters: language === 'bg' ? "изходни + параметри" : "source + parameters",
      type: language === 'bg' ? "трансформация" : "transformation",
      calculation: "< 0.05s",
      route: "/coordinate-transformation",
      docsRoute: "/coordinate-transformation/docs",
      icon: "/icons/coordinate_transformation_icon.svg"
    },
    {
      title: language === 'bg' ? "Изчисление на площ" : "Area Calculation",
      description: language === 'bg'
        ? "Площ на полигон по координати на върховете."
        : "Polygon area from vertex coordinates.",
      parameters: language === 'bg' ? "N ≥ 3 точки" : "N ≥ 3 points",
      type: language === 'bg' ? "кадастър / план" : "cadastre / plan",
      calculation: "< 0.1s",
      route: "/area-calculation",
      docsRoute: "/area-calculation/docs",
      icon: "/icons/area_calculation_icon.svg"
    },
    {
      title: language === 'bg' ? "Разстояние и посочен ъгъл" : "Distance and Bearing",
      description: language === 'bg'
        ? "Разстояние и посочен ъгъл между две точки."
        : "Distance and bearing between two points.",
      parameters: language === 'bg' ? "2 точки (Y, X)" : "2 points (Y, X)",
      type: language === 'bg' ? "основна задача" : "basic task",
      calculation: "< 0.05s",
      route: "/distance-bearing",
      docsRoute: "/distance-bearing/docs",
      icon: "/icons/second_task_icon.svg"
    },
    {
      title: language === 'bg' ? "Пресичане на прави" : "Line Intersection",
      description: language === 'bg'
        ? "Пресичане на две прави по координати на точки."
        : "Intersection of two lines from point coordinates.",
      parameters: language === 'bg' ? "4 точки (2 права)" : "4 points (2 lines)",
      type: language === 'bg' ? "аналитична геометрия" : "analytic geometry",
      calculation: "< 0.05s",
      route: "/line-intersection",
      docsRoute: "/line-intersection/docs",
      icon: "/icons/forward_intersection_icon.svg"
    },
    {
      title: language === 'bg' ? "Ортогонален offset" : "Orthogonal Offset",
      description: language === 'bg'
        ? "Точка перпендикулярно на отсечка — offset от трасе."
        : "Point perpendicular to a segment — offset from alignment.",
      parameters: language === 'bg' ? "A, B, s, d" : "A, B, s, d",
      type: language === 'bg' ? "трасиране" : "stake-out",
      calculation: "< 0.05s",
      route: "/offset-point",
      docsRoute: "/offset-point/docs",
      icon: "/icons/first_task_icon.svg"
    },
    {
      title: language === 'bg' ? "Деление на отсечка" : "Segment Division",
      description: language === 'bg'
        ? "Точка на отсечка по разстояние s или пропорция k."
        : "Point on segment by distance s or ratio k.",
      parameters: language === 'bg' ? "A, B, s/k" : "A, B, s/k",
      type: language === 'bg' ? "трасиране" : "stake-out",
      calculation: "< 0.05s",
      route: "/segment-division",
      docsRoute: "/segment-division/docs",
      icon: "/icons/second_task_icon.svg"
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": language === 'bg' ? "Геодезически инструменти" : "Geodetic Tools",
    "description": language === 'bg' 
      ? "Дванадесет геодезически инструмента на GeoSolver за професионални изчисления"
      : "Twelve geodetic tools in GeoSolver for professional calculations",
    "url": "https://www.geosolver.bg/tools",
    "numberOfItems": tools.length,
    "itemListElement": tools.map((tool, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": tool.title,
      "description": tool.description,
      "url": `https://www.geosolver.bg${tool.route}`
    }))
  };

  return (
    <>
      <SEO
        title={language === 'bg' ? 'Инструменти – Геодезически калкулатори и задачи' : 'Tools – Geodetic Calculators and Tasks'}
        description={language === 'bg'
          ? "Дванадесет геодезически инструмента: основни задачи, засечки, трансформации и площ. Бързи и точни изчисления за геодезисти."
          : "Twelve geodetic tools: basic tasks, intersections, transformations and area. Fast, accurate calculations for surveyors."
        }
        keywords={language === 'bg'
          ? "геодезия, инструменти, калкулатори, първа основна задача, втора основна задача, права засечка, обратна засечка, координати, GNSS"
          : "geodesy, tools, calculators, first basic task, second basic task, forward intersection, resection, coordinates, GNSS"
        }
        canonical="/tools"
        structuredData={structuredData}
      />
    <Layout>
      <div className="w-full bg-stone-50 dark:bg-zinc-950 overflow-hidden py-6 md:py-10 pb-10 md:pb-14">
        <div className="max-w-[400px] md:max-w-[1180px] w-full mx-auto flex flex-col justify-start items-start gap-6 md:gap-10 px-4 md:px-0">
          <div className="w-full flex flex-col justify-start items-start gap-1">
            <div className="text-black dark:text-white text-2xl md:text-3xl font-bold font-['Manrope']">{t.toolsTitle}</div>
            <div className="text-neutral-400 dark:text-zinc-400 text-xs md:text-base font-semibold font-['Manrope']">
              {language === 'bg'
                ? `${tools.length} инструмента за координатни изчисления, засечки и трансформации в геодезията.`
                : `${tools.length} tools for coordinate calculations, intersections and transformations in geodesy.`
              }
            </div>
          </div>

          {user && (
            <>
              <WorkspaceToolsBar items={workspaceTools} language={language} betaLabel={t.beta} />
              <Link
                to="/calculations/history"
                className="text-sm font-semibold font-['Manrope'] underline text-neutral-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                {language === 'bg' ? 'История на изчисления →' : 'Calculation history →'}
              </Link>
            </>
          )}

          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            {tools.map((tool) => (
              <Link
                to={tool.route}
                key={tool.title}
                className="w-full min-w-0 h-full p-3 md:p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_0_rgba(0,0,0,0.2)] hover:shadow-[0_4px_24px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_24px_0_rgba(0,0,0,0.3)] transition"
              >
                <div className="flex-1 flex flex-col justify-start items-start gap-3 min-w-0 w-full">
                  <div className="w-full flex items-start gap-2 min-w-0">
                    <div className="w-7 h-7 bg-black dark:bg-zinc-700 rounded flex flex-col justify-center items-center flex-shrink-0 mt-0.5">
                      <img src={tool.icon} alt="" className="w-4 h-4 dark:invert" />
                    </div>
                    <div className="flex-1 min-w-0 text-black dark:text-white text-sm md:text-base font-semibold font-['Manrope'] leading-snug line-clamp-2 break-words min-h-[2.75rem]">
                      {tool.title}
                    </div>
                    <Link
                      to={tool.docsRoute}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 md:w-4 md:h-4 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-zinc-800 flex-shrink-0 mt-0.5"
                      title={language === 'bg' ? 'Документация' : 'Documentation'}
                      aria-label={language === 'bg' ? 'Документация' : 'Documentation'}
                    >
                      <img src="/icons/question_icon.svg" alt="" className="w-2.5 h-2.5 dark:invert opacity-80" />
                    </Link>
                  </div>
                  <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200 dark:outline-zinc-800" />
                  <div className="text-neutral-400 dark:text-zinc-400 text-xs md:text-sm font-medium font-['Manrope'] leading-relaxed line-clamp-3">{tool.description}</div>
                  <div className="w-full flex flex-col justify-start items-start gap-2">
                    <div className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 rounded-lg flex flex-col justify-start items-start">
                      <div className="text-black dark:text-white text-xs md:text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? "Параметри" : "Parameters"}
                      </div>
                      <div className="text-neutral-400 dark:text-zinc-400 text-xs md:text-sm font-medium font-['Manrope']">{tool.parameters}</div>
                    </div>
                    <div className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 rounded-lg flex flex-col justify-start items-start">
                      <div className="text-black dark:text-white text-xs md:text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? "Тип" : "Type"}
                      </div>
                      <div className="text-neutral-400 dark:text-zinc-400 text-xs md:text-sm font-medium font-['Manrope']">{tool.type}</div>
                    </div>
                    <div className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 rounded-lg flex flex-col justify-start items-start">
                      <div className="text-black dark:text-white text-xs md:text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? "Изчисление" : "Calculation"}
                      </div>
                      <div className="text-neutral-400 dark:text-zinc-400 text-xs md:text-sm font-medium font-['Manrope']">{tool.calculation}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
    </>
  );
};

export default ToolsPage;
