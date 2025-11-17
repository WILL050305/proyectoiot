import './App.css'
import Header from './components/Header'
import Inicio from './components/Inicio'
import Grafico from './components/Grafico'
import { HumedadProvider } from './context/HumedadContext'

function App() {
  const handleNavigate = (route) => {
    console.log('Navegar a:', route);
  };

  return (
    <HumedadProvider>
      <Header onNavigate={handleNavigate} />
      <Inicio />
      <Grafico />
    </HumedadProvider>
  )
}

export default App