import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../layout/Layout';
import ContactsIcon from './ContactsIcon';

const Contacts = () => {
  const [formData, setFormData] = useState({
    email: '',
    title: '',
    content: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/contact', { // смени с твоя backend адрес ако е различен
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setFormData({ email: '', title: '', content: '' });
      } else {
        setError(data.message || 'Възникна грешка.');
      }
    } catch {
      setError('Възникна грешка при изпращане.');
    }
    setLoading(false);
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

      <div className="max-w-[1180px] mx-auto px-4 py-16 flex flex-col gap-20">
        {/* Contact Form Section */}
        <div className="self-stretch flex flex-col justify-start items-start gap-10">
          <div className="self-stretch justify-start text-black text-3xl font-bold font-['Manrope']">Контакти</div>
          <div className="self-stretch p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-6">
            <div className="inline-flex flex-col justify-start items-start gap-4">
              <div className="w-[464px] flex flex-col justify-start items-start gap-2">
                <div className="justify-start text-black text-sm font-medium font-['Manrope']">Имейл</div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                  placeholder="Имейл"
                />
              </div>
              <div className="w-[464px] flex flex-col justify-start items-start gap-2">
                <div className="justify-start text-black text-sm font-medium font-['Manrope']">Заглавие</div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                  placeholder="Заглавие"
                />
              </div>
              <div className="w-[464px] flex flex-col justify-start items-start gap-2">
                <div className="justify-start text-black text-sm font-medium font-['Manrope']">Съдържание</div>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className="self-stretch h-24 p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope'] resize-none"
                  placeholder="Съдържание"
                />
              </div>
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-4 py-2 bg-black rounded-lg inline-flex justify-start items-center gap-3"
              >
                <div className="justify-start text-white text-base font-medium font-['Manrope']">Изпрати</div>
              </button>
            </div>
            <div className="flex-1 inline-flex flex-col justify-center items-center gap-4">
              <ContactsIcon />
              <div className="text-center justify-start text-neutral-400 text-sm font-medium font-['Manrope']">
                На среща сме за всякакви въпроси.<br />help@geosolver.bg
              </div>
            </div>
          </div>
          {success && <div className="text-green-600 mt-2">{success}</div>}
          {error && <div className="text-red-600 mt-2">{error}</div>}
          {loading && <div className="text-gray-500 mt-2">Изпращане...</div>}
        </div>

        {/* FAQ Section */}
        <div className="self-stretch p-6 bg-white rounded-3xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-start items-start gap-6">
            <div className="justify-start text-black text-3xl font-bold font-['Manrope']">Често задавани въпроси</div>
            <div className="self-stretch inline-flex justify-start items-start gap-5">
                <div className="flex-1 inline-flex flex-col justify-center items-start gap-5">
                    <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
                        <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">Как се изчисляват безплатните изчисления?</div>
                        <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope']">Всеки регистриран потребител получава 5 безплатни изчисления за всяка задача на месец.</div>
                    </div>
                    <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
                        <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">Какви видове изчисления поддържа GeoSolver?</div>
                        <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope']">GeoSolver предлага координатни трансформации, изчисления на площ, дължина и обем, GNSS анализ и други инструменти.</div>
                    </div>
                </div>
                <div className="flex-1 self-stretch inline-flex flex-col justify-center items-start gap-5">
                    <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
                        <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">Какви са начините за плащане?</div>
                        <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope']">Приемаме плащания чрез кредитна/дебитна карта и PayPal.</div>
                    </div>
                    <div className="self-stretch flex-1 p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
                        <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">Сигурни ли са моите данни?</div>
                        <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope']">Всички данни се съхраняват криптирано и не се споделят с трети страни.</div>
                    </div>
                </div>
                <div className="flex-1 self-stretch inline-flex flex-col justify-center items-start gap-5">
                    <div className="self-stretch flex-1 p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
                        <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">Как мога да се абонирам?</div>
                        <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope']">Изберете професионален план и следвайте стъпките за плащане. След потвърждение ще имате неограничен достъп.</div>
                    </div>
                    <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
                        <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">Има ли мобилна версия на GeoSolver?</div>
                        <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope']">GeoSolver е направен специално за да се използва на малки устройства.</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contacts; 