"use client";

export interface ContinueGameModalProps {
  onContinue: () => void;
  onNewGame: () => void;
}

export function ContinueGameModal({
  onContinue,
  onNewGame,
}: ContinueGameModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="continue-game-title"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
        <h2
          id="continue-game-title"
          className="text-2xl font-bold text-gray-900 mb-4"
        >
          Jogo Salvo Encontrado
        </h2>

        <p className="text-gray-600 mb-6">
          Você tem um jogo em andamento. Deseja continuar de onde parou ou
          começar um novo jogo?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onContinue}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            autoFocus
          >
            Continuar
          </button>

          <button
            onClick={onNewGame}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Novo Jogo
          </button>
        </div>
      </div>
    </div>
  );
}
