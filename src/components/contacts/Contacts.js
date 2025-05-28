import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../layout/Layout';

const Contacts = () => {
  const [formData, setFormData] = useState({
    email: '',
    title: '',
    content: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const faqs = [
    {
      question: "Как се изчисляват безплатните изчисления?",
      answer: "Всеки регистриран потребител получава 5 безплатни изчисления за всяка задача на месец."
    },
    {
      question: "Какви видове изчисления поддържа GeoSolver?",
      answer: "GeoSolver предлага координатни трансформации, изчисления на площ, дължина и обем, GNSS анализ и други инструменти."
    },
    {
      question: "Какви са начините за плащане?",
      answer: "Приемаме плащания чрез кредитна/дебитна карта и PayPal."
    },
    {
      question: "Сигурни ли са моите данни?",
      answer: "Всички данни се съхраняват криптирано и не се споделят с трети страни."
    },
    {
      question: "Как мога да се абонирам?",
      answer: "Изберете професионален план и следвайте стъпките за плащане. След потвърждение ще имате неограничен достъп."
    },
    {
      question: "Има ли мобилна версия на GeoSolver?",
      answer: "GeoSolver е направен специално за да се използва на малки устройства."
    }
  ];

  return (
    <Layout>
      <Helmet>
        <title>Контакти | GeoSolver</title>
        <meta name="description" content="Свържете се с нас за всякакви въпроси относно GeoSolver - вашият надежден партньор за геодезически изчисления." />
      </Helmet>

      <div className="w-full min-h-screen bg-stone-50">
        <div className="max-w-[1180px] mx-auto px-4 py-10 flex flex-col gap-20">
          {/* Contact Form Section */}
          <div className="flex flex-col gap-10">
            <h1 className="text-3xl font-bold font-['Manrope']">Контакти</h1>
            <div className="p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-black text-sm font-medium font-['Manrope']">Имейл</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-sm font-medium font-['Manrope']"
                    placeholder="Имейл"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-black text-sm font-medium font-['Manrope']">Заглавие</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-sm font-medium font-['Manrope']"
                    placeholder="Заглавие"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-black text-sm font-medium font-['Manrope']">Съдържание</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className="h-24 p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-sm font-medium font-['Manrope'] resize-none"
                    placeholder="Съдържание"
                  />
                </div>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-black rounded-lg inline-flex justify-center items-center text-white text-base font-medium font-['Manrope']"
                >
                  Изпрати
                </button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-14 bg-black" />
                <div className="w-12 h-14 bg-black" />
                <div className="w-12 h-14 bg-black" />
                <img className="w-44 h-36 opacity-50" src="https://placehold.co/180x148" alt="Contact" />
                <p className="text-center text-neutral-400 text-sm font-medium font-['Manrope']">
                  На среща сме за всякакви въпроси. help@geosolver.bg
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="p-6 bg-white rounded-3xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200">
            <h2 className="text-3xl font-bold font-['Manrope'] mb-6">Често задавани въпроси</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {faqs.map((faq, index) => (
                <div key={index} className="p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-3">
                  <h3 className="text-black text-base font-semibold font-['Manrope']">{faq.question}</h3>
                  <p className="text-neutral-400 text-sm font-medium font-['Manrope']">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contacts; 