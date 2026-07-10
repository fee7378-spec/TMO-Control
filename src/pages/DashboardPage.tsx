import React, { useMemo, useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { esteirasCollection, analistasCollection, medicoesCollection } from '../db/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { formatTime, formatDateTime } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Select, Label } from '../components/ui/Input';
import { Activity, Clock, Users, Hash } from 'lucide-react';
import type { Medicao, Esteira, Analista } from '../types';

export function DashboardPage() {
  const [selectedEsteiraFilter, setSelectedEsteiraFilter] = useState<string>('all');

  const [esteirasDocs] = useCollectionData(esteirasCollection, { idField: 'id' });
  const esteiras = (esteirasDocs as Esteira[]) || [];

  const [analistasDocs] = useCollectionData(analistasCollection, { idField: 'id' });
  const analistas = (analistasDocs as Analista[]) || [];

  const [medicoesDocs] = useCollectionData(medicoesCollection, { idField: 'id' });
  
  const medicoes = useMemo(() => {
    return ((medicoesDocs as Medicao[]) || []).map(m => {
      const esteira = esteiras.find(e => e.id === m.esteiraId);
      const analista = analistas.find(a => a.id === m.analistaId);
      return {
        ...m,
        esteiraNome: esteira?.nome || 'Desconhecida',
        analistaNome: analista?.nome || 'Desconhecido'
      };
    });
  }, [medicoesDocs, esteiras, analistas]);

  const filteredMedicoes = useMemo(() => {
    if (selectedEsteiraFilter === 'all') return medicoes;
    return medicoes.filter(m => m.esteiraId === selectedEsteiraFilter);
  }, [medicoes, selectedEsteiraFilter]);

  // KPIs
  const totalMedicoes = filteredMedicoes.length;
  const totalTempo = filteredMedicoes.reduce((acc, curr) => acc + curr.tempoEmMilissegundos, 0);
  const tmoGeral = totalMedicoes > 0 ? Math.floor(totalTempo / totalMedicoes) : 0;
  
  const uniqueAnalistas = new Set(filteredMedicoes.map(m => m.analistaId)).size;
  const uniqueEsteiras = new Set(filteredMedicoes.map(m => m.esteiraId)).size;

  const menorTempo = filteredMedicoes.length > 0 ? Math.min(...filteredMedicoes.map(m => m.tempoEmMilissegundos)) : 0;
  const maiorTempo = filteredMedicoes.length > 0 ? Math.max(...filteredMedicoes.map(m => m.tempoEmMilissegundos)) : 0;

  // Chart Data: TMO por Esteira
  const tmoPorEsteiraData = useMemo(() => {
    const map = new Map<string, { total: number, count: number }>();
    medicoes.forEach(m => {
      const curr = map.get(m.esteiraNome) || { total: 0, count: 0 };
      map.set(m.esteiraNome, { total: curr.total + m.tempoEmMilissegundos, count: curr.count + 1 });
    });
    return Array.from(map.entries()).map(([nome, data]) => ({
      name: nome,
      TMO: Math.floor((data.total / data.count) / 1000) // em segundos
    }));
  }, [medicoes]);

  // Chart Data: Evolução Temporal
  const evolucaoData = useMemo(() => {
    const map = new Map<string, { total: number, count: number }>();
    filteredMedicoes.forEach(m => {
      const date = formatDateTime(m.createdAt).split(' ')[0];
      const curr = map.get(date) || { total: 0, count: 0 };
      map.set(date, { total: curr.total + m.tempoEmMilissegundos, count: curr.count + 1 });
    });
    return Array.from(map.entries()).map(([date, data]) => ({
      date: date.substring(0, 5), // DD/MM
      TMO: Math.floor((data.total / data.count) / 1000)
    })).sort((a,b) => a.date.localeCompare(b.date)); // Simple string sort for DD/MM, fine for preview
  }, [filteredMedicoes]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm text-sm">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-blue-600">TMO: {payload[0].value}s</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard Executivo</h1>
        
        <div className="w-full md:w-64">
          <Select value={selectedEsteiraFilter} onChange={(e) => setSelectedEsteiraFilter(e.target.value)} className="bg-white">
            <option value="all">Todas as Esteiras</option>
            {esteiras.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">TMO Geral</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatTime(tmoGeral).substring(0, 8)}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
              <Hash className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tratativas Medidas</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalMedicoes}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Analistas Ativos</p>
              <h3 className="text-2xl font-bold text-gray-900">{uniqueAnalistas}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Esteiras Utilizadas</p>
              <h3 className="text-2xl font-bold text-gray-900">{selectedEsteiraFilter === 'all' ? esteiras.length : 1}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>TMO Médio por Esteira (Segundos)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tmoPorEsteiraData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="TMO" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução do TMO por Dia (Segundos)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucaoData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="TMO" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 0}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {selectedEsteiraFilter !== 'all' && (
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800">Indicadores Detalhados - {esteiras.find(e => e.id === selectedEsteiraFilter)?.nome}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold">Menor Tempo</p>
                <p className="text-lg font-mono font-medium mt-1">{formatTime(menorTempo).substring(0,8)}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold">Maior Tempo</p>
                <p className="text-lg font-mono font-medium mt-1">{formatTime(maiorTempo).substring(0,8)}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold">Tempo Total Acumulado</p>
                <p className="text-lg font-mono font-medium mt-1">{formatTime(totalTempo).substring(0,8)}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold">Última Medição</p>
                <p className="text-lg font-medium mt-1 text-slate-700">
                  {filteredMedicoes.length > 0 ? formatDateTime(Math.max(...filteredMedicoes.map(m => m.createdAt))).split(' ')[1] : '--'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
