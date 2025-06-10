import TransitAnimation from "./components/TransitAnimation";
import { useEffect, useState } from "react";

function TransitPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/transits?date=2025-06-10")
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return <p>Cargando tránsitos…</p>;

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">
        Tránsitos para {data.date.split("T")[0]}
      </h2>
      <TransitAnimation positions={data.positions} size={350} />
      {/* Puedes listar data.aspects debajo si quieres */}
    </div>
  );
}