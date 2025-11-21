import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";

export interface FilterOptions {
  searchTerm: string;
  fileType: string;
  dateRange: "all" | "today" | "week" | "month";
  sortBy: "name" | "date" | "size";
  sortOrder: "asc" | "desc";
}

interface DashboardFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  isLoading?: boolean;
}

/**
 * Componente de Filtros Avançados para Dashboard
 * Permite filtrar arquivos por tipo, data, nome e ordenação
 */
export function DashboardFilters({
  onFilterChange,
  isLoading = false,
}: DashboardFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    fileType: "all",
    dateRange: "all",
    sortBy: "date",
    sortOrder: "desc",
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      searchTerm: "",
      fileType: "all",
      dateRange: "all",
      sortBy: "date",
      sortOrder: "desc",
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.fileType !== "all" ||
    filters.dateRange !== "all";

  return (
    <Card className="p-4 mb-6">
      {/* Barra de Busca Principal */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar arquivos..."
            value={filters.searchTerm}
            onChange={(e) =>
              handleFilterChange({ searchTerm: e.target.value })
            }
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              {Object.values(filters).filter((v) => v && v !== "all").length}
            </span>
          )}
        </Button>
      </div>

      {/* Filtros Expandidos */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Tipo de Arquivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Arquivo
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: "all", label: "Todos" },
                { value: "image", label: "Imagens" },
                { value: "document", label: "Documentos" },
                { value: "video", label: "Vídeos" },
                { value: "audio", label: "Áudio" },
                { value: "spreadsheet", label: "Planilhas" },
                { value: "archive", label: "Arquivos" },
                { value: "other", label: "Outros" },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleFilterChange({ fileType: type.value })}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.fileType === type.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Intervalo de Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intervalo de Data
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: "all", label: "Todos os Tempos" },
                { value: "today", label: "Hoje" },
                { value: "week", label: "Última Semana" },
                { value: "month", label: "Último Mês" },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() =>
                    handleFilterChange({
                      dateRange: range.value as FilterOptions["dateRange"],
                    })
                  }
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.dateRange === range.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ordenação */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar Por
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  handleFilterChange({
                    sortBy: e.target.value as FilterOptions["sortBy"],
                  })
                }
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Nome</option>
                <option value="date">Data</option>
                <option value="size">Tamanho</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordem
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  handleFilterChange({
                    sortOrder: e.target.value as FilterOptions["sortOrder"],
                  })
                }
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="asc">Crescente</option>
                <option value="desc">Decrescente</option>
              </select>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isLoading}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
