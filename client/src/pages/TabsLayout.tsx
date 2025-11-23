import React, { useState } from 'react';
import { Plus, X, Settings, File, Bell, Mail, DollarSign, Users, BarChart3, MessageSquare, Lightbulb, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Registros from './Registros';
import Tarefas from './Tarefas';
import Email from './Email';
import Multas from './Multas';
import Cobranca from './Cobranca';
import Caixa from './Caixa';
import Metricas from './Metricas';
import Whatsapp from './Whatsapp';
import Aprendizados from './Aprendizados';

interface Tab {
  id: string;
  name: string;
  type: 'registros' | 'tarefas' | 'email' | 'multas' | 'cobranca' | 'caixa' | 'metricas' | 'whatsapp' | 'aprendizados';
  icon: React.ReactNode;
  integrations: string[];
}

const TAB_TYPES = [
  { value: 'registros', label: 'Registros', icon: <File className="w-4 h-4" /> },
  { value: 'tarefas', label: 'Tarefas', icon: <Bell className="w-4 h-4" /> },
  { value: 'email', label: 'E-mail', icon: <Mail className="w-4 h-4" /> },
  { value: 'multas', label: 'Multas', icon: <AlertCircle className="w-4 h-4" /> },
  { value: 'cobranca', label: 'Cobrança', icon: <DollarSign className="w-4 h-4" /> },
  { value: 'caixa', label: 'Caixa', icon: <DollarSign className="w-4 h-4" /> },
  { value: 'metricas', label: 'Métricas', icon: <BarChart3 className="w-4 h-4" /> },
  { value: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'aprendizados', label: 'Aprendizados', icon: <Lightbulb className="w-4 h-4" /> },
];

const AVAILABLE_INTEGRATIONS = [
  'registros', 'tarefas', 'email', 'multas', 'cobranca', 'caixa', 'metricas', 'whatsapp'
];

export default function TabsLayout() {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      name: 'Visão Geral',
      type: 'registros',
      icon: <File className="w-4 h-4" />,
      integrations: []
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [newTabName, setNewTabName] = useState('');
  const [newTabType, setNewTabType] = useState<Tab['type']>('registros');
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);

  const addTab = () => {
    if (!newTabName.trim()) {
      toast.error('Nome da aba é obrigatório');
      return;
    }

    const newTab: Tab = {
      id: Date.now().toString(),
      name: newTabName,
      type: newTabType,
      icon: TAB_TYPES.find(t => t.value === newTabType)?.icon || <File className="w-4 h-4" />,
      integrations: selectedIntegrations
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setNewTabName('');
    setNewTabType('registros');
    setSelectedIntegrations([]);
    toast.success(`Aba "${newTabName}" criada com sucesso`);
  };

  const deleteTab = (id: string) => {
    if (tabs.length === 1) {
      toast.error('Não é possível deletar a última aba');
      return;
    }

    const tabToDelete = tabs.find(t => t.id === id);
    setTabs(tabs.filter(t => t.id !== id));
    
    if (activeTabId === id) {
      setActiveTabId(tabs[0].id);
    }

    toast.success(`Aba "${tabToDelete?.name}" deletada`);
  };

  const activeTab = tabs.find(t => t.id === activeTabId);

  const renderTabContent = () => {
    if (!activeTab) return null;

    switch (activeTab.type) {
      case 'registros':
        return <Registros />;
      case 'tarefas':
        return <Tarefas />;
      case 'email':
        return <Email />;
      case 'multas':
        return <Multas />;
      case 'cobranca':
        return <Cobranca />;
      case 'caixa':
        return <Caixa />;
      case 'metricas':
        return <Metricas />;
      case 'whatsapp':
        return <Whatsapp />;
      case 'aprendizados':
        return <Aprendizados />;
      default:
        return <div>Tipo de aba não reconhecido</div>;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Menu Bar - Tipo Mac */}
      <div className="bg-white border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-foreground">Mini-ERP</h1>
            <span className="text-sm text-muted-foreground">Automação Manus</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Configurações
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Configurações do Sistema</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Tema</Label>
                    <Select defaultValue="light">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Escuro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Idioma</Label>
                    <Select defaultValue="pt">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt">Português</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 px-6 py-2 bg-gray-50 border-t border-border overflow-x-auto">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg border border-b-0 cursor-pointer transition-colors ${
                activeTabId === tab.id
                  ? 'bg-white border-border text-foreground'
                  : 'bg-gray-100 border-gray-200 text-muted-foreground hover:bg-gray-200'
              }`}
              onClick={() => setActiveTabId(tab.id)}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTab(tab.id);
                }}
                className="ml-2 hover:bg-red-100 rounded p-0.5 transition-colors"
              >
                <X className="w-3 h-3 text-red-600" />
              </button>
            </div>
          ))}

          {/* Add Tab Button */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center justify-center w-8 h-8 ml-2 rounded-full hover:bg-gray-200 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Aba</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tab-name">Nome da Aba</Label>
                  <Input
                    id="tab-name"
                    placeholder="Ex: Vendas, Clientes, etc"
                    value={newTabName}
                    onChange={(e) => setNewTabName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="tab-type">Tipo de Aba</Label>
                  <Select value={newTabType} onValueChange={(value) => setNewTabType(value as Tab['type'])}>
                    <SelectTrigger id="tab-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TAB_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Integrar com outras abas</Label>
                  <div className="space-y-2 mt-2">
                    {AVAILABLE_INTEGRATIONS.map(integration => (
                      <label key={integration} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIntegrations.includes(integration)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIntegrations([...selectedIntegrations, integration]);
                            } else {
                              setSelectedIntegrations(selectedIntegrations.filter(i => i !== integration));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">
                          {TAB_TYPES.find(t => t.value === integration)?.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button onClick={addTab} className="w-full">
                  Criar Aba
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-background">
        {renderTabContent()}
      </div>
    </div>
  );
}
