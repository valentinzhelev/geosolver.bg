import React from "react";
import Layout from '../../layout/Layout';
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

const ToolsPage = () => {
  const tools = [
    {
      title: "Първа основна задача",
      description: "Изчисляване на координати по начална точка, ъгъл и дължина.",
      parameters: "1 точка, ъгъл, дължина",
      type: "Трансформация / полярен метод",
      calculation: "< 0.05s",
      route: "/first-task",
      icon: "/icons/first_task_icon.svg"
    },
    {
      title: "Втора основна задача",
      description: "Изчисляване на ъгъл и разстояние между две точки по координати.",
      parameters: "4 входни координати",
      type: "GNSS / координатна геодезия",
      calculation: "< 0.1s",
      route: "/second-task",
      icon: "/icons/second_task_icon.svg"    
    },
    {
      title: "Права засечка",
      description: "Координати чрез посока и разстояние от известна точка.",
      parameters: "1 известна точка + мерки",
      type: "GNSS / тахиметрично измерване",
      calculation: "< 0.08s",
      route: "/forward-intersection",
      icon: "/icons/forward_intersection_icon.svg"
    },
    {
      title: "Обратна засечка",
      description: "Определяне на позиция по ъгли от известни точки.",
      parameters: "2–3 известни точки и ъгли",
      type: "координатна геодезия / класика",
      calculation: "~ 0.1s",
      route: "/resection",
      icon: "/icons/resection_icon.svg"
    },
    {
      title: "Полярна засечка",
      description: "Изчисления на непознати точки по мерки от база.",
      parameters: "2 точки база + мерки",
      type: "полярни координати",
      calculation: "< 0.09s",
      route: "/polar-intersection",
      icon: "/icons/polar_intersection_icon.svg"
    },
    {
      title: "Координатна трансформация",
      description: "Преобразуване между локални и глобални координатни системи.",
      parameters: "3+ точки / трансформационни",
      type: "Хелмерт, афинна, 7 параметъра",
      calculation: "< 0.2s",
      route: "/coordinate-transformation",
      icon: "/icons/coordinate_transformation_icon.svg"
    },
    {
      title: "Задача за ханзен",
      description: "Изчисляване на координатите на точка чрез ъглово преместване от две известни точки (A и B).",
      parameters: "координати на A и B + ъгли α, β",
      type: "аналитична триангулация",
      calculation: "< 0.1s",
      route: "/hansen-task",
      icon: "/icons/hansen-task-icon.svg"
    }
  ];

  return (
    <>
    <Helmet>
      <title>Инструменти – Геодезически калкулатори и задачи | GeoSolver</title>
      <meta
        name="description"
        content="Интерактивни геодезически инструменти за координатни трансформации, засечки, изчисления на ъгли и разстояния. Всичко за геодезията на едно място – бързо, лесно и удобно."
      />
      <meta
        name="keywords"
        content="геодезия, инструменти, калкулатори, координатни трансформации, права засечка, обратна засечка, полярна засечка, Hansen, GNSS, онлайн изчисления"
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
              <div className="text-black text-2xl md:text-3xl font-bold font-['Manrope']">Инструменти</div>
              <div className="text-neutral-400 text-xs md:text-base font-semibold font-['Manrope']">Интерактивни инструменти за решаване на задачи в геодезията – от координатни трансформации до класически засечки.</div>
            </div>
            <div className="flex justify-start items-center gap-3">
              <div className="text-black text-sm md:text-base font-semibold font-['Manrope']">Инструменти в разработка</div>
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
                      <div className="text-black text-xs md:text-sm font-medium font-['Manrope']">Параметри</div>
                      <div className="text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']">{tool.parameters}</div>
                    </div>
                    <div className="w-full px-3 py-2 bg-stone-50 rounded-lg flex flex-col justify-start items-start">
                      <div className="text-black text-xs md:text-sm font-medium font-['Manrope']">Тип</div>
                      <div className="text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']">{tool.type}</div>
                    </div>
                    <div className="w-full px-3 py-2 bg-stone-50 rounded-lg flex flex-col justify-start items-start">
                      <div className="text-black text-xs md:text-sm font-medium font-['Manrope']">Изчисление</div>
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