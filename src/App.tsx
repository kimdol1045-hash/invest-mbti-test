import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Test from './pages/Test';
import Result from './pages/Result';
import Encyclopedia from './pages/Encyclopedia';
import IndicatorDetail from './pages/IndicatorDetail';
import Quiz from './pages/Quiz';
import Progress from './pages/Progress';
import Compatibility from './pages/Compatibility';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/test" element={<Test />} />
      <Route path="/result" element={<Result />} />
      <Route path="/encyclopedia" element={<Encyclopedia />} />
      <Route path="/indicator/:id" element={<IndicatorDetail />} />
      <Route path="/quiz/:id" element={<Quiz />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/compatibility/:type" element={<Compatibility />} />
    </Routes>
  );
}

export default App;
