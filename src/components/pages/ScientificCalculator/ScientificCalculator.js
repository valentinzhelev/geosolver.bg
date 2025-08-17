import React, { useState } from "react";
import Layout from '../../layout/Layout';
import { Helmet } from "react-helmet";
import { evaluate, format } from "mathjs";

const angleModes = [
  { label: "DEG", value: "deg" },
  { label: "RAD", value: "rad" },
  { label: "GRAD", value: "grad" }
];

const scientificButtons = [
  ["C", "(", ")", "←", "%", "nCr", "nPr", "mod", "!"],
  ["7", "8", "9", "/", "x^2", "x^3", "x^y", "10^x", "√x"],
  ["4", "5", "6", "*", "³√x", "y√x", "1/x", "+/-", "."],
  ["1", "2", "3", "-", "sin", "cos", "tan", "cot", "sec"],
  ["0", ",", "=", "+", "sinh", "cosh", "tanh", "π", "e"],
  ["asin", "acos", "atan", "acot", "asec", "acsc", "log", "ln", "exp"]
];

const docRows = [
  { buttons: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], usage: "Въвеждане на цифри" },
  { buttons: ["+", "-", "*", "/"], usage: "Основни операции (събиране, изваждане, умножение, деление)" },
  { buttons: ["="], usage: "Получаване на резултата от изчисление" },
  { buttons: ["C"], usage: "Изчистване на екрана на калкулатора" },
  { buttons: ["←"], usage: "Изтриване на последния въведен символ" },
  { buttons: ["(", ")"], usage: "Скоби за групиране на изрази" },
  { buttons: ["."], usage: "Десетична точка" },
  { buttons: ["+/-"], usage: "Промяна на знака на числото" },
  { buttons: ["%"], usage: "Процент от число" },
  { buttons: [","], usage: "Разделяне на аргументи на функция" },
  { buttons: ["x^2", "x^3", "x^y", "10^x"], usage: "Степенуване" },
  { buttons: ["√x", "³√x", "y√x"], usage: "Коренуване" },
  { buttons: ["1/x"], usage: "Обратно число" },
  { buttons: ["!"], usage: "Факториел" },
  { buttons: ["mod"], usage: "Остатък от деление" },
  { buttons: ["nCr", "nPr"], usage: "Комбинаторика" },
  { buttons: ["π", "e"], usage: "Математически константи" },
  { buttons: ["sin", "cos", "tan", "cot", "sec", "csc"], usage: "Тригонометрични функции (според избрания режим)" },
  { buttons: ["sinh", "cosh", "tanh"], usage: "Хиперболични функции" },
  { buttons: ["asin", "acos", "atan", "acot", "asec", "acsc"], usage: "Обратни тригонометрични функции" },
  { buttons: ["log", "ln", "exp"], usage: "Логаритми и експоненциални функции" }
];

const functionButtons = [
  "sin", "cos", "tan", "cot", "sec", "csc", "sinh", "cosh", "tanh",
  "asin", "acos", "atan", "acot", "asec", "acsc", "log", "ln", "exp", "sqrt", "nthRoot"
];

function preprocess(expr, angleMode) {
  let e = expr
    .replace(/π/g, "pi")
    .replace(/÷/g, "/")
    .replace(/×/g, "*")
    .replace(/x\^2/g, "^2")
    .replace(/x\^3/g, "^3")
    .replace(/x\^y/g, "^")
    .replace(/10\^x/g, "10^")
    .replace(/√x/g, "sqrt(")
    .replace(/³√x/g, "nthRoot(")
    .replace(/y√x/g, "nthRoot(")
    .replace(/mod/g, "%")
    .replace(/ln/g, "log")
    .replace(/exp/g, "exp")
    .replace(/\^/g, "^");

  // Преобразуване на аргумента на тригонометричните функции според режима
  if (angleMode !== "rad") {
    e = e.replace(/(sin|cos|tan|cot|sec|csc|asin|acos|atan|acot|asec|acsc)\(([^)]+)\)/g, (match, fn, arg) => {
      if (angleMode === "deg") {
        return `${fn}((${arg}) * pi / 180)`;
      }
      if (angleMode === "grad") {
        return `${fn}((${arg}) * pi / 200)`;
      }
      return match;
    });
  }
  return e;
}

const ScientificCalculator = () => {
  const [angleMode, setAngleMode] = useState("deg");
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("0");
  const [history, setHistory] = useState([]);

  const handleButton = (btn) => {
    if (btn === "C") {
      setExpression("");
      setResult("0");
      return;
    }
    if (btn === "←") {
      setExpression(expression.slice(0, -1));
      return;
    }
    if (btn === "=") {
      try {
        const expr = preprocess(expression, angleMode);
        const res = format(evaluate(expr), { precision: 14 });
        setResult(res);
        setHistory([{ expr: expression, res }, ...history]);
      } catch {
        setResult("Грешка");
      }
      return;
    }
    if (btn === "+/-") {
      if (expression) {
        if (expression[0] === "-") setExpression(expression.slice(1));
        else setExpression("-" + expression);
      }
      return;
    }
    if (functionButtons.includes(btn)) {
      setExpression(expression + btn + "(");
      return;
    }
    setExpression(expression + btn);
  };

  return (
    <>
      <Helmet>
        <title>GeoSolver – Научен калкулатор</title>
        <meta name="description" content="Мощен научен калкулатор за сложни математически изрази, тригонометрия, логаритми, степени и още. Безплатен онлайн калкулатор за ученици, студенти и професионалисти." />
        <meta name="keywords" content="научен калкулатор, калкулатор, математика, тригонометрия, логаритми, степени, изчисления, GeoSolver" />
      </Helmet>
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center py-8 px-2 md:px-0">
          <div className="w-full max-w-[1180px] flex flex-col gap-10">
            <div className="flex flex-col gap-10 w-full">
              <h1 className="text-black text-3xl font-bold font-['Manrope']">Научен калкулатор</h1>
              <div className="w-full p-4 bg-white rounded-xl border border-gray-200 flex flex-col gap-4">
                {/* Дисплей */}
                <div className="flex flex-row items-center justify-between mb-2">
                  <div className="flex gap-2">
                    {angleModes.map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => setAngleMode(mode.value)}
                        className={`px-3 py-1 rounded-lg text-sm font-semibold font-['Manrope'] outline outline-1 outline-gray-200 transition ${angleMode === mode.value ? 'bg-black text-white' : 'bg-white text-black'}`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-2 text-right text-xl font-mono text-black min-w-[200px]">
                    {expression || "0"}
                    <div className="text-xs text-neutral-500">= {result}</div>
                  </div>
                </div>
                {/* Бутони */}
                <div className="w-full grid grid-cols-9 gap-2">
                  {scientificButtons.flat().map((btn, i) => (
                    <button
                      key={btn + i}
                      className="px-2 py-2 bg-white rounded outline outline-1 outline-gray-200 text-black text-sm font-medium font-['Manrope'] hover:bg-gray-50 transition"
                      onClick={() => handleButton(btn)}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
                {/* История */}
                {history.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-neutral-500 mb-1">История:</div>
                    <ul className="text-xs text-neutral-700 space-y-1">
                      {history.slice(0, 5).map((h, i) => (
                        <li key={i}>{h.expr} = <b>{h.res}</b></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            {/* Документация */}
            {/* Desktop version */}
            <div className="hidden md:flex w-full p-6 bg-white rounded-3xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex-col gap-6">
              <div className="justify-start text-black text-3xl font-bold font-['Manrope']">Документация</div>
              <div className="self-stretch bg-stone-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-px overflow-hidden">
                <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                  <div className="w-72 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Бутон</div>
                  </div>
                  <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Употреба</div>
                  </div>
                </div>
                {docRows.map((row, idx) => (
                  <div key={idx} className="self-stretch inline-flex justify-start items-center gap-px">
                    <div className="w-72 px-3 py-2 bg-white flex justify-center items-center gap-1 flex-wrap content-center">
                      {row.buttons.map((b, i) => (
                        <div key={i} className="px-2 py-1 bg-white rounded outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center gap-3">
                          <div className="justify-start text-black text-sm font-medium font-['Manrope']">{b}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 self-stretch px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{row.usage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Mobile version */}
            <div className="flex md:hidden self-stretch inline-flex flex-col justify-start items-start gap-3">
              <div className="justify-start text-black text-lg font-bold font-['Manrope']">Документация</div>
              <div className="w-96 flex flex-col justify-start items-start gap-2.5">
                <div className="bg-stone-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-px overflow-hidden">
                  <div className="shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                    <div className="w-72 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Бутон</div>
                    </div>
                    <div className="w-72 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Употреба</div>
                    </div>
                  </div>
                  {docRows.map((row, idx) => (
                    <div key={idx} className="inline-flex justify-start items-center gap-px">
                      <div className="w-72 self-stretch px-3 py-2 bg-white flex justify-center items-center gap-1 flex-wrap content-center">
                        {row.buttons.map((b, i) => (
                          <div key={i} className="px-2 py-1 bg-white rounded outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center gap-3">
                            <div className="justify-start text-black text-sm font-medium font-['Manrope']">{b}</div>
                          </div>
                        ))}
                      </div>
                      <div className="w-72 self-stretch px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="flex-1 justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{row.usage}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ScientificCalculator; 