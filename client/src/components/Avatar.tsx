interface AvatarProps {
  nome?: string | null;
  numero?: string;
  tamanho?: "sm" | "md" | "lg";
  cor?: string;
}

export function Avatar({ nome, numero, tamanho = "md", cor }: AvatarProps) {
  const cores = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];

  // Gerar cor baseada no número
  const corSelecionada =
    cor ||
    cores[
      (numero || "").charCodeAt(0) % cores.length
    ];

  const tamanhos = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  // Extrair iniciais
  const iniciais = nome
    ? nome
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : numero
    ? numero.slice(-2).toUpperCase()
    : "?";

  return (
    <div
      className={`${tamanhos[tamanho]} ${corSelecionada} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
    >
      {iniciais}
    </div>
  );
}
