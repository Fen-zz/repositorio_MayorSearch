import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";

export default function Home() {
  const handleSearch = (query: string) => {
    console.log("Buscando:", query);
  };

  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-5xl flex flex-col items-center">
          <h1 className="text-4xl font-bold text-blue-800 mb-8 text-center">
            ¿Qué estás buscando ahora?
          </h1>

          <SearchBar onSearch={handleSearch} />

          {/* Resultados o futuras tarjetas aquí */}
        </div>
      </main>
    </div>
  );
}
