"use client";

export function PauseOverlay() {
  return (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Jogo Pausado</h2>
        <p className="text-xl text-gray-300">
          Clique em "Retomar" para continuar
        </p>
      </div>
    </div>
  );
}
