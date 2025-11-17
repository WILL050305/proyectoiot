const Header = ({ onNavigate }) => {
  return (
    <header className="bg-gray-500 shadow-md fixed top-0 left-0 right-0 w-full z-50">
      <div className="w-full px-4">
        <div className="flex items-center justify-between h-16 pr-8">
          {/* Logo/Imagen - Izquierda */}
          <div className="shrink-0">
            <button 
              onClick={() => onNavigate && onNavigate('/')}
              className="flex items-center hover:scale-110 hover:opacity-80 transition-all duration-300 ease-in-out cursor-pointer"
            >
              <img
                src="https://via.placeholder.com/150x50?text=Logo"
                alt="Logo"
                className="h-10 w-auto"
              />
            </button>
          </div>

          {/* Navegación - Derecha */}
          <nav className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate && onNavigate('/reportes')}
              className="text-white hover:text-blue-300 hover:scale-110 font-medium transition-all duration-300 ease-in-out cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-300 after:transition-all after:duration-300 hover:after:w-full"
            >
              Reportes
            </button>
            <button
              onClick={() => onNavigate && onNavigate('/gastos')}
              className="text-white hover:text-blue-300 hover:scale-110 font-medium transition-all duration-300 ease-in-out cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-300 after:transition-all after:duration-300 hover:after:w-full"
            >
              Gastos
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;