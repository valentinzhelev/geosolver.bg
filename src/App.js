import { Helmet } from "react-helmet";

function App() {
  return (
    <>
      <Helmet>
        <title>GeoSolver - Онлайн калкулатор за геодезия</title>
        <meta
          name="description"
          content="GeoSolver - онлайн геодезически калкулатор за точни и бързи изчисления. Решавай задачи като права засечка, обратна засечка и трансформации с интуитивен интерфейс и запазване на историята."
        />
        <meta
          name="keywords"
          content="геодезия, геодезически калкулатори, права засечка, обратна засечка, онлайн изчисления, координатни трансформации, геодезически задачи"
        />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="GeoSolver" />
      </Helmet>

      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/purva-zadacha" element={<PurvaZadacha />} />
          <Route path="/vtora-zadacha" element={<VtoraZadacha />} />
          <Route path="/prava-zasechka" element={<PravaZasechka />} />
          <Route path="/za-nas" element={<AboutPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
