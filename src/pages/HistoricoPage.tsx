import React, { useState, useEffect, useRef } from 'react';
import { useListVals } from 'react-firebase-hooks/database';
import { esteirasRef, analistasRef, medicoesRef, push, set, query, orderByChild, remove, ref, db } from '../db/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label, Select } from '../components/ui/Input';
import { formatTime, formatDateTime } from '../utils';
import { Play, Pause, Square, RotateCcw, Save, Download, Plus, X, Edit3, Trash2 } from 'lucide-react';
import type { Medicao, Esteira, Analista } from '../types';
import { useConfirm } from '../components/ui/ConfirmDialog';

function MedicaoManual({
  esteiras,
  analistas
}: {
  esteiras: Esteira[],
  analistas: Analista[]
}) {
  const [selectedEsteira, setSelectedEsteira] = useState('');
  const [selectedAnalista, setSelectedAnalista] = useState('');
  const [tempoMinutos, setTempoMinutos] = useState('');
  const [tempoSegundos, setTempoSegundos] = useState('');
  const [observacao, setObservacao] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEsteira || !selectedAnalista || (!tempoMinutos && !tempoSegundos)) {
      alert('Preencha a esteira, analista e o tempo.');
      return;
    }

    const min = parseInt(tempoMinutos || '0', 10);
    const sec = parseInt(tempoSegundos || '0', 10);
    const elapsedTime = (min * 60 * 1000) + (sec * 1000);

    const now = Date.now();
    const novaMedicao: Medicao = {
      esteiraId: selectedEsteira,
      analistaId: selectedAnalista,
      tempoEmMilissegundos: elapsedTime,
      tempoFormatado: formatTime(elapsedTime),
      horaInicio: now - elapsedTime,
      horaFim: now,
      observacao: observacao ? `[MANUAL] ${observacao}` : '[MANUAL]',
      createdAt: now
    };

    const newRef = push(medicoesRef);
    await set(newRef, novaMedicao);
    setSelectedEsteira('');
    setSelectedAnalista('');
    setTempoMinutos('');
    setTempoSegundos('');
    setObservacao('');
  };

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="bg-blue-50/50 pb-4 border-b border-blue-100">
        <CardTitle className="text-blue-900 flex items-center text-lg">
          <Edit3 className="w-4 h-4 mr-2" /> Inserção Manual de Tratativa
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Esteira</Label>
              <Select value={selectedEsteira} onChange={e => setSelectedEsteira(e.target.value)} required>
                <option value="">Selecione...</option>
                {esteiras.filter(e => e.status === 'Ativa').map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Analista</Label>
              <Select value={selectedAnalista} onChange={e => setSelectedAnalista(e.target.value)} required>
                <option value="">Selecione...</option>
                {analistas.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tempo (Minutos)</Label>
              <Input type="number" min="0" value={tempoMinutos} onChange={e => setTempoMinutos(e.target.value)} placeholder="Ex: 5" />
            </div>
            <div className="space-y-2">
              <Label>Tempo (Segundos)</Label>
              <Input type="number" min="0" max="59" value={tempoSegundos} onChange={e => setTempoSegundos(e.target.value)} placeholder="Ex: 30" />
            </div>
          </div>
          <div className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label>Observação (Opcional)</Label>
              <Input value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Detalhes da tratativa..." />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" /> Salvar Manual
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

const MedicaoCronometro: React.FC<{ 
  onRemove: () => void, 
  esteiras: Esteira[], 
  analistas: Analista[]
}> = ({ 
  onRemove, 
  esteiras, 
  analistas
}) => {
  const [selectedEsteira, setSelectedEsteira] = useState('');
  const [selectedAnalista, setSelectedAnalista] = useState('');
  const [observacao, setObservacao] = useState('');
  
  // Stopwatch state
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [horaInicioAbsoluta, setHoraInicioAbsoluta] = useState<number | null>(null);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setElapsedTime(Date.now() - (startTime || Date.now()));
      }, 10);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, startTime]);

  const handleStart = () => {
    if (!selectedEsteira || !selectedAnalista) {
      alert('Selecione a Esteira e o Analista antes de iniciar.');
      return;
    }
    if (!horaInicioAbsoluta) {
      setHoraInicioAbsoluta(Date.now());
    }
    setStartTime(Date.now() - elapsedTime);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setStartTime(null);
    setHoraInicioAbsoluta(null);
  };

  const handleFinish = async () => {
    if (elapsedTime === 0 || !horaInicioAbsoluta) return;
    setIsRunning(false);
    
    const novaMedicao: Medicao = {
      esteiraId: selectedEsteira,
      analistaId: selectedAnalista,
      tempoEmMilissegundos: elapsedTime,
      tempoFormatado: formatTime(elapsedTime),
      horaInicio: horaInicioAbsoluta,
      horaFim: Date.now(),
      observacao,
      createdAt: Date.now()
    };

    const newRef = push(medicoesRef);
    await set(newRef, novaMedicao);
    handleReset();
    setObservacao('');
  };

  return (
    <Card className="border-blue-100 shadow-blue-50 relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8"
        onClick={onRemove}
        title="Remover este cronômetro"
      >
        <X className="w-4 h-4" />
      </Button>
      <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-4">
        <CardTitle className="text-blue-900 flex items-center text-lg"><Play className="w-4 h-4 mr-2" /> Cronômetro</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Esteira</Label>
                <Select value={selectedEsteira} onChange={e => setSelectedEsteira(e.target.value)} disabled={isRunning || elapsedTime > 0}>
                  <option value="">Selecione...</option>
                  {esteiras.filter(e => e.status === 'Ativa').map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Analista</Label>
                <Select value={selectedAnalista} onChange={e => setSelectedAnalista(e.target.value)} disabled={isRunning || elapsedTime > 0}>
                  <option value="">Selecione...</option>
                  {analistas.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observação (Opcional)</Label>
              <Input value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Detalhes da tratativa..." />
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-4 bg-slate-50 p-3 lg:p-4 rounded-xl border border-slate-200 overflow-hidden">
            <div className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold tracking-tight text-slate-800 whitespace-nowrap tabular-nums">
              {formatTime(elapsedTime)}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {!isRunning ? (
                <Button onClick={handleStart} className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-8">
                  <Play className="w-3 h-3 mr-1" /> {elapsedTime === 0 ? 'Iniciar' : 'Continuar'}
                </Button>
              ) : (
                <Button onClick={handlePause} className="bg-amber-500 hover:bg-amber-600 text-xs px-2 py-1 h-8">
                  <Pause className="w-3 h-3 mr-1" /> Pausar
                </Button>
              )}
              <Button onClick={handleFinish} disabled={elapsedTime === 0} variant="default" className="text-xs px-2 py-1 h-8">
                <Square className="w-3 h-3 mr-1" /> Finalizar
              </Button>
              <Button onClick={handleReset} variant="outline" size="icon" title="Reiniciar" className="h-8 w-8 flex-shrink-0">
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HistoricoPage() {
  const { confirm } = useConfirm();
  const [cronometros, setCronometros] = useState<string[]>(['1']);

  const [esteirasDocs] = useListVals<Esteira>(esteirasRef, { keyField: 'id' });
  const esteiras = esteirasDocs || [];
  
  const [analistasDocs] = useListVals<Analista>(analistasRef, { keyField: 'id' });
  const analistas = analistasDocs || [];

  const [medicoesDocs, loading] = useListVals<Medicao>(query(medicoesRef, orderByChild('createdAt')), { keyField: 'id' });
  
  const medicoes = (medicoesDocs || [])
    .map(m => {
    const esteira = esteiras.find(e => e.id === m.esteiraId);
    const analista = analistas.find(a => a.id === m.analistaId);
    return {
      ...m,
      esteiraNome: esteira?.nome || 'N/A',
      analistaNome: analista?.nome || 'N/A'
    };
  })
  .sort((a, b) => b.createdAt - a.createdAt) || [];

  const addCronometro = () => {
    setCronometros([...cronometros, Math.random().toString(36).substr(2, 9)]);
  };

  const removeCronometro = (id: string) => {
    setCronometros(cronometros.filter(c => c !== id));
  };

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Esteira,Analista,Tempo,Hora Início,Hora Fim,Observação\n"
      + medicoes.map(m => 
          `${m.id},${m.esteiraNome},${m.analistaNome},${m.tempoFormatado},${formatDateTime(m.horaInicio)},${formatDateTime(m.horaFim)},${m.observacao}`
        ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historico_medicoes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Excluir Registro',
      message: 'Tem certeza que deseja excluir este registro?',
      destructive: true,
      confirmText: 'Excluir'
    });
    if (isConfirmed) {
      await remove(ref(db, `medicoes/${id}`));
    }
  };

  const handleDeleteAll = async () => {
    const isConfirmed = await confirm({
      title: 'Excluir Todos os Registros',
      message: 'ATENÇÃO: Tem certeza que deseja excluir TODOS os registros? Esta ação não pode ser desfeita.',
      destructive: true,
      confirmText: 'Excluir Todos'
    });
    if (isConfirmed) {
      await remove(ref(db, 'medicoes'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Registro e Histórico</h1>
        <Button onClick={addCronometro} variant="outline" className="bg-white">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Cronômetro
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {cronometros.map(id => (
          <MedicaoCronometro 
            key={id} 
            onRemove={() => removeCronometro(id)} 
            esteiras={esteiras as Esteira[]} 
            analistas={analistas as Analista[]} 
          />
        ))}
      </div>

      <MedicaoManual esteiras={esteiras} analistas={analistas} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Histórico de Tratativas</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" /> Exportar CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeleteAll} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" /> Excluir Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Esteira</th>
                  <th className="px-4 py-3">Analista</th>
                  <th className="px-4 py-3">Tempo</th>
                  <th className="px-4 py-3">Início</th>
                  <th className="px-4 py-3">Fim</th>
                  <th className="px-4 py-3">Observação</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-4 text-center text-gray-500">Carregando...</td></tr>
                ) : medicoes.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-4 text-center text-gray-500">Nenhum registro encontrado.</td></tr>
                ) : medicoes.map((m: any) => (
                  <tr key={m.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(m.createdAt).split(' ')[0]}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{m.esteiraNome}</td>
                    <td className="px-4 py-3">{m.analistaNome}</td>
                    <td className="px-4 py-3 font-mono font-medium text-blue-600">{m.tempoFormatado}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(m.horaInicio).split(' ')[1]}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(m.horaFim).split(' ')[1]}</td>
                    <td className="px-4 py-3 truncate max-w-xs" title={m.observacao}>{m.observacao}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
