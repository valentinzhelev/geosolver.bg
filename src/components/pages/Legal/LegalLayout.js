import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../shared/SEO';
import Layout from '../../layout/Layout';

/**
 * Shared layout for legal pages (Privacy, Terms, Disclaimer).
 * Monochrome, readable long-form typography.
 */
const LegalLayout = ({ title, updated, intro, sections = [], canonical }) => (
  <>
    <SEO title={title} canonical={canonical} />
    <Layout>
      <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950">
        <div className="max-w-3xl mx-auto px-4 lg:px-6 pt-10 lg:pt-16 pb-20">
          <Link
            to="/"
            className="text-sm text-neutral-500 dark:text-zinc-400 hover:text-black dark:hover:text-white font-['Manrope']"
          >
            ← GeoSolver
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-black dark:text-white font-['Manrope']">{title}</h1>
          {updated && (
            <p className="mt-2 text-xs uppercase tracking-wide text-neutral-400 dark:text-zinc-500 font-['Manrope']">
              {updated}
            </p>
          )}
          {intro && (
            <p className="mt-5 text-sm leading-relaxed text-neutral-700 dark:text-zinc-300 font-['Manrope']">{intro}</p>
          )}

          <div className="mt-8 flex flex-col gap-8">
            {sections.map((s, i) => (
              <section key={i} className="flex flex-col gap-2">
                <h2 className="text-lg font-bold text-black dark:text-white font-['Manrope']">
                  {i + 1}. {s.heading}
                </h2>
                {(Array.isArray(s.body) ? s.body : [s.body]).map((p, j) => (
                  <p key={j} className="text-sm leading-relaxed text-neutral-600 dark:text-zinc-400 font-['Manrope']">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  </>
);

export default LegalLayout;
