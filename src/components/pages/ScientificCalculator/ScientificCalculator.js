import React, { useState, useEffect, useCallback } from "react";
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { evaluate, format } from "mathjs";
import { useTranslation } from '../../../hooks/useTranslation';

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

  // Convert trig argument by mode
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

const CALC_BTN =
  "px-2 py-2 bg-white dark:bg-zinc-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 text-black dark:text-white text-sm font-medium font-['Manrope'] hover:bg-stone-100 dark:hover:bg-zinc-700 active:bg-stone-200 dark:active:bg-zinc-600 transition-colors";

const CALC_BTN_PRIMARY =
  "px-2 py-2 bg-black dark:bg-white rounded-lg text-white dark:text-black text-sm font-semibold font-['Manrope'] hover:opacity-90 transition-opacity";

const DOC_PANEL = 'w-full bg-stone-50 dark:bg-zinc-800/80 rounded-xl p-4 border border-gray-100 dark:border-zinc-700/80';

const ExampleList = ({ lines, className = 'text-neutral-600 dark:text-zinc-400 space-y-1' }) => (
  <div className={className}>
    {(lines || []).map((line, i) => (
      <div key={i}>{line}</div>
    ))}
  </div>
);

const ScientificCalculator = () => {
  const { t } = useTranslation();
  const docRows = t.calcDocRows || [];
  const [angleMode, setAngleMode] = useState("deg");
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("0");
  const [history, setHistory] = useState([]);

  const handleButton = useCallback((btn) => {
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
      if (!expression.trim()) {
        setResult("0");
        return;
      }
      try {
        const expr = preprocess(expression, angleMode);
        const res = evaluate(expr);
        
        // Check for valid result
        if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
          const formattedRes = format(res, { precision: 14 });
          setResult(formattedRes);
          setHistory([{ expr: expression, res: formattedRes }, ...history.slice(0, 9)]); // Keep only 10 items
        } else {
          setResult(t.calcError);
        }
      } catch (error) {
        console.error('Calculation error:', error);
        setResult(t.calcError);
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
  }, [expression, angleMode, history, t]);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key;
      
      // Prevent default for calculator keys
      if (/[0-9+\-*/.=()%]/.test(key) || key === 'Enter' || key === 'Backspace' || key === 'Delete') {
        event.preventDefault();
      }
      
      // Handle number keys
      if (/[0-9]/.test(key)) {
        handleButton(key);
        return;
      }
      
      // Handle operation keys
      if (key === '+') handleButton('+');
      else if (key === '-') handleButton('-');
      else if (key === '*') handleButton('*');
      else if (key === '/') handleButton('/');
      else if (key === '.') handleButton('.');
      else if (key === '(') handleButton('(');
      else if (key === ')') handleButton(')');
      else if (key === '%') handleButton('%');
      else if (key === '=' || key === 'Enter') handleButton('=');
      else if (key === 'Backspace' || key === 'Delete') handleButton('←');
      else if (key === 'Escape' || key.toLowerCase() === 'c') handleButton('C');
      
      // Handle special keys
      else if (key.toLowerCase() === 'p') handleButton('π');
      else if (key.toLowerCase() === 'e') handleButton('e');
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleButton]);

  return (
    <>
      <SEO
        title={t.scientificCalculatorTitle}
        description={t.scientificCalculatorDesc}
        keywords={t.scientificCalculatorKeywords}
        canonical="/scientific-calculator"
      />
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors flex flex-col items-center py-8 px-2 md:px-0">
          <div className="w-full max-w-[1180px] flex flex-col gap-10">
            <div className="flex flex-col gap-10 w-full">
              <h1 className="text-black dark:text-white text-3xl font-bold font-['Manrope']">{t.scientificCalculatorTitle}</h1>
              <div className="w-full p-4 md:p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col gap-4 shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)]">
                {/* Дисплей */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-1">
                  <div className="inline-flex flex-wrap gap-1 rounded-lg bg-stone-100 dark:bg-zinc-800 p-0.5">
                    {angleModes.map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setAngleMode(mode.value)}
                        className={`px-3 py-1.5 rounded-md text-sm font-semibold font-['Manrope'] transition-colors ${
                          angleMode === mode.value
                            ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                            : 'text-neutral-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                  <div className="w-full lg:min-w-[240px] lg:max-w-md bg-stone-100 dark:bg-zinc-950 rounded-lg px-4 py-3 text-right border border-gray-200 dark:border-zinc-700">
                    <div className="text-lg md:text-xl font-mono text-neutral-500 dark:text-zinc-400 break-all min-h-[1.5rem]">
                      {expression || '0'}
                    </div>
                    <div className="text-xl md:text-2xl font-mono font-semibold text-black dark:text-white break-all">
                      = {result}
                    </div>
                  </div>
                </div>
                {/* Бутони */}
                <div className="w-full grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-1.5 md:gap-2">
                  {scientificButtons.flat().map((btn, i) => (
                    <button
                      key={btn + i}
                      type="button"
                      className={btn === '=' ? CALC_BTN_PRIMARY : CALC_BTN}
                      onClick={() => handleButton(btn)}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
                {/* История */}
                {history.length > 0 && (
                  <div className="mt-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <div className="text-sm font-medium text-neutral-500 dark:text-zinc-400 mb-2 font-['Manrope']">{t.calcHistory}</div>
                    <ul className="text-xs text-neutral-700 dark:text-zinc-300 space-y-1 font-mono">
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
            <div className="hidden md:flex w-full p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex-col gap-6">
              <div className="justify-start text-black dark:text-white text-3xl font-bold font-['Manrope']">{t.calcDocumentation}</div>
              
              {/* Примери */}
              <div className={DOC_PANEL}>
                <div className="text-black dark:text-white text-lg font-semibold font-['Manrope'] mb-3">{t.calcUsageExamples}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-black dark:text-white mb-2">{t.calcBasicOps}</div>
                    <ExampleList lines={t.calcExampleBasic} />
                  </div>
                  <div>
                    <div className="font-medium text-black dark:text-white mb-2">{t.calcTrigonometry}</div>
                    <ExampleList lines={t.calcExampleTrig} />
                  </div>
                  <div>
                    <div className="font-medium text-black dark:text-white mb-2">{t.calcLogsPowers}</div>
                    <ExampleList lines={t.calcExampleLogs} />
                  </div>
                  <div>
                    <div className="font-medium text-black dark:text-white mb-2">{t.calcSpecialFuncs}</div>
                    <ExampleList lines={t.calcExampleSpecial} />
                  </div>
                </div>
              </div>
              
              {/* Клавиатурни съкращения */}
              <div className={DOC_PANEL}>
                <div className="text-black dark:text-white text-lg font-semibold font-['Manrope'] mb-3">{t.calcKeyboardShortcuts}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-black dark:text-white mb-2">{t.calcBasicKeys}</div>
                    <div className="text-neutral-600 dark:text-zinc-400 space-y-1">
                      <div>• <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1 rounded">0-9</span> - {t.calcDigits}</div>
                      <div>• <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1 rounded">+ - * /</span> - {t.calcOperations}</div>
                      <div>• <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1 rounded">Enter</span> - {t.calcCalculate}</div>
                      <div>• <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1 rounded">Backspace</span> - {t.calcDelete}</div>
                      <div>• <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1 rounded">Escape</span> - {t.calcClear}</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-black dark:text-white mb-2">{t.calcSpecialKeys}</div>
                    <div className="text-neutral-600 dark:text-zinc-400 space-y-1">
                      <div>• <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1 rounded">( )</span> - {t.calcParentheses}</div>
                      <div>• <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1 rounded">.</span> - {t.calcDecimalPoint}</div>
                      <div>• <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1 rounded">%</span> - {t.calcPercent}</div>
                      <div>• <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1 rounded">P</span> - {t.calcKeyPi}</div>
                      <div>• <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1 rounded">E</span> - {t.calcKeyE}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="self-stretch bg-stone-50 dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-px overflow-hidden">
                <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                  <div className="w-72 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.calcButton}</div>
                  </div>
                  <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.calcUsage}</div>
                  </div>
                </div>
                {docRows.map((row, idx) => (
                  <div key={idx} className="self-stretch inline-flex justify-start items-center gap-px">
                    <div className="w-72 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-1 flex-wrap content-center">
                      {row.buttons.map((b, i) => (
                        <div key={i} className="px-2 py-1 bg-white dark:bg-zinc-900 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex justify-center items-center gap-3">
                          <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{b}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 self-stretch px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{row.usage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Mobile version */}
            <div className="flex md:hidden self-stretch inline-flex flex-col justify-start items-start gap-3">
              <div className="justify-start text-black dark:text-white text-lg font-bold font-['Manrope']">{t.calcDocumentation}</div>
              
              {/* Примери за мобилна версия */}
              <div className={DOC_PANEL}>
                <div className="text-black dark:text-white text-base font-semibold font-['Manrope'] mb-3">{t.calcUsageExamples}</div>
                <div className="text-sm space-y-2">
                  <div>
                    <div className="font-medium text-black dark:text-white mb-1">{t.calcBasicOps}</div>
                    <ExampleList lines={t.calcExampleBasicShort} className="text-neutral-600 dark:text-zinc-400 text-xs space-y-1" />
                  </div>
                  <div>
                    <div className="font-medium text-black dark:text-white mb-1">{t.calcTrigonometry}</div>
                    <ExampleList lines={t.calcExampleTrigShort} className="text-neutral-600 dark:text-zinc-400 text-xs space-y-1" />
                  </div>
                  <div>
                    <div className="font-medium text-black dark:text-white mb-1">{t.calcLogsPowers}</div>
                    <ExampleList lines={t.calcExampleLogs} className="text-neutral-600 dark:text-zinc-400 text-xs space-y-1" />
                  </div>
                </div>
              </div>
              
              {/* Клавиатурни съкращения за мобилна версия */}
              <div className={DOC_PANEL}>
                <div className="text-black dark:text-white text-base font-semibold font-['Manrope'] mb-3">{t.calcKeyboardShortcuts}</div>
                <div className="text-sm space-y-2">
                  <div>
                    <div className="font-medium text-black dark:text-white mb-1">{t.calcBasicKeys}</div>
                    <div className="text-neutral-600 dark:text-zinc-400 text-xs space-y-1">
                      <div>• <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1 rounded text-xs">0-9</span> - {t.calcDigits}</div>
                      <div>• <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1 rounded text-xs">+ - * /</span> - {t.calcOperations}</div>
                      <div>• <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1 rounded text-xs">Enter</span> - {t.calcCalculate}</div>
                      <div>• <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1 rounded text-xs">Backspace</span> - {t.calcDelete}</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-black dark:text-white mb-1">{t.calcSpecialKeys}</div>
                    <div className="text-neutral-600 dark:text-zinc-400 text-xs space-y-1">
                      <div>• <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1 rounded text-xs">Escape</span> - {t.calcClear}</div>
                      <div>• <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1 rounded text-xs">P</span> - {t.calcKeyPi}</div>
                      <div>• <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1 rounded text-xs">E</span> - {t.calcKeyE}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full flex flex-col justify-start items-start gap-2.5">
                <div className="w-full bg-stone-50 dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-px overflow-hidden">
                  <div className="shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                    <div className="w-72 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.calcButton}</div>
                    </div>
                    <div className="w-72 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.calcUsage}</div>
                    </div>
                  </div>
                  {docRows.map((row, idx) => (
                    <div key={idx} className="inline-flex justify-start items-center gap-px">
                      <div className="w-72 self-stretch px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-1 flex-wrap content-center">
                        {row.buttons.map((b, i) => (
                          <div key={i} className="px-2 py-1 bg-white dark:bg-zinc-900 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex justify-center items-center gap-3">
                            <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{b}</div>
                          </div>
                        ))}
                      </div>
                      <div className="w-72 self-stretch px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                        <div className="flex-1 justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{row.usage}</div>
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