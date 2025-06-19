import React from "react";
import Layout from '../../layout/Layout';
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useTranslation } from '../../../hooks/useTranslation';

const ToolsPage = () => {
  const { t, language } = useTranslation();

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
      icon: "/icons/resection_icon.svg"
    },
    {
      title: language === 'bg' ? "Полярна засечка" : "Polar Intersection",
      description: language === 'bg'
        ? "Изчисления на непознати точки по мерки от база."
        : "Calculate unknown points using measurements from base.",
      parameters: language === 'bg' ? "2 точки база + мерки" : "2 base points + measurements",
      type: language === 'bg' ? "полярни координати" : "polar coordinates",
      calculation: "< 0.09s",
      route: "/polar-intersection",
      icon: "/icons/polar_intersection_icon.svg"
    },
    {
      title: language === 'bg' ? "Координатна трансформация" : "Coordinate Transformation",
      description: language === 'bg'
        ? "Преобразуване между локални и глобални координатни системи."
        : "Convert between local and global coordinate systems.",
      parameters: language === 'bg' ? "3+ точки / трансформационни" : "3+ points / transformational",
      type: language === 'bg' ? "Хелмерт, афинна, 7 параметъра" : "Helmert, affine, 7 parameters",
      calculation: "< 0.2s",
      route: "/coordinate-transformation",
      icon: "/icons/coordinate_transformation_icon.svg"
    },
    {
      title: language === 'bg' ? "Задача за ханзен" : "Hansen Task",
      description: language === 'bg'
        ? "Изчисляване на координатите на точка чрез ъглово преместване от две известни точки (A и B)."
        : "Calculate point coordinates using angular displacement from two known points (A and B).",
      parameters: language === 'bg' ? "координати на A и B + ъгли α, β" : "coordinates of A and B + angles α, β",
      type: language === 'bg' ? "аналитична триангулация" : "analytical triangulation",
      calculation: "< 0.1s",
      route: "/hansen-task",
      icon: "/icons/hansen-task-icon.svg"
    }
  ];

  return (
    <>
    <Helmet>
      <title>
        {language === 'bg' 
          ? 'Инструменти – Геодезически калкулатори и задачи | GeoSolver'
          : 'Tools – Geodetic Calculators and Tasks | GeoSolver'
        }
      </title>
      <meta
        name="description"
        content={language === 'bg'
          ? "Интерактивни геодезически инструменти за координатни трансформации, засечки, изчисления на ъгли и разстояния. Всичко за геодезията на едно място – бързо, лесно и удобно."
          : "Interactive geodetic tools for coordinate transformations, intersections, angle and distance calculations. Everything for geodesy in one place - fast, easy, and convenient."
        }
      />
      <meta
        name="keywords"
        content={language === 'bg'
          ? "геодезия, инструменти, калкулатори, координатни трансформации, права засечка, обратна засечка, полярна засечка, Hansen, GNSS, онлайн изчисления"
          : "geodesy, tools, calculators, coordinate transformations, forward intersection, resection, polar intersection, Hansen, GNSS, online calculations"
        }
      />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="GeoSolver" />
    </Helmet>
    <Layout>
      <div className="min-h-[calc(100vh-300px)] bg-stone-50 w-full overflow-hidden py-6 md:py-10">
        <div className="max-w-[400px] md:max-w-[1180px] w-full mx-auto flex flex-col justify-center items-start gap-6 md:gap-10 px-4 md:px-0">
          {/* Header Section */}
          <div className="w-full flex flex-col md:flex-row md:justify-between md:items-end gap-4 md:gap-0">
            <div className="w-full md:w-[580px] flex flex-col justify-start items-start gap-1">
              <div className="text-black text-2xl md:text-3xl font-bold font-['Manrope']">{t.toolsTitle}</div>
              <div className="text-neutral-400 text-xs md:text-base font-semibold font-['Manrope']">
                {language === 'bg'
                  ? "Интерактивни инструменти за решаване на задачи в геодезията – от координатни трансформации до класически засечки."
                  : "Interactive tools for solving geodesy tasks - from coordinate transformations to classic intersections."
                }
              </div>
            </div>
            <div className="flex justify-start items-center gap-3">
              <div className="text-black text-sm md:text-base font-semibold font-['Manrope']">
                {language === 'bg' ? "Инструменти в разработка" : "Tools in development"}
              </div>
              <div className="w-10 h-5 md:w-12 md:h-6 p-[3.33px] md:p-1 bg-black rounded-3xl flex justify-end items-center gap-1.5 md:gap-2">
                <div className="w-3.5 h-3.5 md:w-4 md:h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
          {/* Tools Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {tools.map((tool) => (
              <Link
                to={tool.route}
                key={tool.title}
                className="w-full md:w-72 p-3 md:p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-start gap-3 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_0_rgba(0,0,0,0.08)] transition"
              >
                <div className="flex-1 flex flex-col justify-start items-start gap-3">
                  <div className="w-full flex justify-between items-center">
                    <div className="flex justify-start items-center gap-2">
                      <div className="w-7 h-7 bg-black rounded flex flex-col justify-center items-center">
                        <img src={tool.icon} alt="Tool Icon" className="w-4 h-4" />
                      </div>
                      <div className="text-black text-sm md:text-base font-semibold font-['Manrope']">{tool.title}</div>
                    </div>
                    <div className="w-5 h-5 md:w-4 md:h-4 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 flex items-center justify-center">
                      <img src="/icons/question_icon.svg" alt="?" className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
                  <div className="text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']">{tool.description}</div>
                  <div className="w-full flex flex-col justify-start items-start gap-2">
                    <div className="w-full px-3 py-2 bg-stone-50 rounded-lg flex flex-col justify-start items-start">
                      <div className="text-black text-xs md:text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? "Параметри" : "Parameters"}
                      </div>
                      <div className="text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']">{tool.parameters}</div>
                    </div>
                    <div className="w-full px-3 py-2 bg-stone-50 rounded-lg flex flex-col justify-start items-start">
                      <div className="text-black text-xs md:text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? "Тип" : "Type"}
                      </div>
                      <div className="text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']">{tool.type}</div>
                    </div>
                    <div className="w-full px-3 py-2 bg-stone-50 rounded-lg flex flex-col justify-start items-start">
                      <div className="text-black text-xs md:text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? "Изчисление" : "Calculation"}
                      </div>
                      <div className="text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']">{tool.calculation}</div>
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