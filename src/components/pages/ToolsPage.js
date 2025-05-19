import React from "react";
import Layout from '../layout/Layout';
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const ToolsPage = () => {
  const tools = [
    {
      title: "Първа основна задача",
      description: "Изчисляване на координати по начална точка, ъгъл и дължина.",
      parameters: "1 точка, ъгъл, дължина",
      type: "Трансформация / полярен метод",
      calculation: "< 0.05s",
      route: "/first-task",
      icon: "/first_task_icon.svg"
    },
    {
      title: "Втора основна задача",
      description: "Изчисляване на ъгъл и разстояние между две точки по координати.",
      parameters: "4 входни координати",
      type: "GNSS / координатна геодезия",
      calculation: "< 0.1s",
      route: "/second-task",
      icon: "/second_task_icon.svg"    
    },
    {
      title: "Права засечка",
      description: "Координати чрез посока и разстояние от известна точка.",
      parameters: "1 известна точка + мерки",
      type: "GNSS / тахиметрично измерване",
      calculation: "< 0.08s",
      route: "/forward-intersection",
      icon: "/forward_intersection_icon.svg"
    },
    {
      title: "Обратна засечка",
      description: "Определяне на позиция по ъгли от известни точки.",
      parameters: "2–3 известни точки и ъгли",
      type: "координатна геодезия / класика",
      calculation: "~ 0.1s",
      route: "/resection",
      icon: "/resection_icon.svg"
    },
    {
      title: "Полярна засечка",
      description: "Изчисления на непознати точки по мерки от база.",
      parameters: "2 точки база + мерки",
      type: "полярни координати",
      calculation: "< 0.09s",
      route: "/polar-intersection",
      icon: "/polar_intersection_icon.svg"
    },
    {
      title: "Координатна трансформация",
      description: "Преобразуване между локални и глобални координатни системи.",
      parameters: "3+ точки / трансформационни",
      type: "Хелмерт, афинна, 7 параметъра",
      calculation: "< 0.2s",
      route: "/coordinate-transformation",
      icon: "/coordinate_transformation_icon.svg"
    },
    {
      title: "Задача за ханзен",
      description: "Изчисляване на координатите на точка чрез ъглово преместване от две известни точки (A и B).",
      parameters: "координати на A и B + ъгли α, β",
      type: "аналитична триангулация",
      calculation: "< 0.1s",
      route: "/hansen-task",
      icon: "/hansen-task-icon.svg"
    }
  ];

  const location = useLocation();

  return (
    <Layout>
      <div className="min-h-[calc(100vh-300px)] bg-stone-50 w-full overflow-hidden py-10">
        <div className="max-w-[1180px] w-full mx-auto flex flex-col justify-center items-start gap-10">
          {/* Header Section */}
          <div className="w-full flex justify-between items-end">
            <div className="w-[580px] flex flex-col justify-start items-start gap-1">
              <div className="text-black text-3xl font-bold font-['Manrope']">Инструменти</div>
              <div className="text-neutral-400 text-base font-semibold font-['Manrope']">Интерактивни инструменти за решаване на задачи в геодезията – от координатни трансформации до класически засечки.</div>
            </div>
            <div className="flex justify-start items-center gap-3">
              <div className="text-black text-base font-semibold font-['Manrope']">Инструменти в разработка</div>
              <div className="w-12 h-6 p-1 bg-black rounded-[30px] flex justify-end items-center gap-2">
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
          {/* Tools Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {tools.map((tool) => (
              <Link
                to={tool.route}
                key={tool.title}
                className="w-72 p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-start gap-3 hover:shadow-lg transition"
              >
                <div className="flex-1 flex flex-col justify-start items-start gap-3">
                  <div className="w-full flex justify-between items-center">
                    <div className="flex justify-start items-center gap-2">
                      <div className="w-7 h-7 bg-black rounded flex flex-col justify-center items-center">
                        <img src={tool.icon} alt="Tool Icon" className="w-4 h-4" />
                      </div>
                      <div className="text-black text-base font-semibold font-['Manrope']">{tool.title}</div>
                    </div>
                    <div className="w-4 h-4 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 flex items-center justify-center">
                      <img src="/question_icon.svg" alt="?" className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
                  <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{tool.description}</div>
                  <div className="w-full flex flex-col justify-start items-start gap-2">
                    <div className="w-full px-3 py-2 bg-stone-50 rounded-lg flex flex-col justify-start items-start">
                      <div className="text-black text-sm font-medium font-['Manrope']">Параметри</div>
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{tool.parameters}</div>
                    </div>
                    <div className="w-full px-3 py-2 bg-stone-50 rounded-lg flex flex-col justify-start items-start">
                      <div className="text-black text-sm font-medium font-['Manrope']">Тип</div>
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{tool.type}</div>
                    </div>
                    <div className="w-full px-3 py-2 bg-stone-50 rounded-lg flex flex-col justify-start items-start">
                      <div className="text-black text-sm font-medium font-['Manrope']">Изчисление</div>
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{tool.calculation}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ToolsPage; 