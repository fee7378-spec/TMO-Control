import React, { useMemo, useState } from 'react';
import { useListVals } from 'react-firebase-hooks/database';
import { esteirasRef, analistasRef, medicoesRef } from '../db/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { formatTimeHHMMSS, formatDateTime } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Select, Label } from '../components/ui/Input';
import { Activity, Clock, Users, Hash } from 'lucide-react';
import type { Medicao, Esteira, Analista } from '../types';

export function DashboardPage() {
  const [selectedEsteiraFilter, setSelectedEsteiraFilter] = useState<string>('all');

  const [esteirasDocs] = useListVals<Esteira>(esteirasRef, { keyField: 'id' });
  const esteiras = Array.from(new Map((esteirasDocs || []).map(e => [e.id, e])).values()).sort((a,b) => a.nome.localeCompare(b.nome));

  const [analistasDocs] = useListVals<Analista>(analistasRef, { keyField: 'id' });
  const analistas = Array.from(new Map((analistasDocs || []).map(a => [a.id, a])).values()).sort((a,b) => a.nome.localeCompare(b.nome));

  const [medicoesDocs] = useListVals<Medicao>(medicoesRef, { keyField: 'id' });
  const medicoesRaw = Array.from(new Map((medicoesDocs || []).map(m => [m.id, m])).values());
  
  const medicoes = useMemo(() => {
    return medicoesRaw.map(m => {
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
  const tmoMedio = totalMedicoes > 0 ? Math.floor(totalTempo / totalMedicoes) : 0;
  
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
      TMO: parseFloat(((data.total / data.count) / 60000).toFixed(2)), // em minutos
      ms: Math.floor(data.total / data.count)
    })).sort((a,b) => a.name.localeCompare(b.name));
  }, [medicoes]);

  // Chart Data: TMO por Analista
  const tmoPorAnalistaData = useMemo(() => {
    const map = new Map<string, { total: number, count: number }>();
    filteredMedicoes.forEach(m => {
      const curr = map.get(m.analistaNome) || { total: 0, count: 0 };
      map.set(m.analistaNome, { total: curr.total + m.tempoEmMilissegundos, count: curr.count + 1 });
    });
    return Array.from(map.entries()).map(([nome, data]) => ({
      name: nome,
      TMO: parseFloat(((data.total / data.count) / 60000).toFixed(2)), // em minutos
      ms: Math.floor(data.total / data.count)
    })).sort((a,b) => a.name.localeCompare(b.name));
  }, [filteredMedicoes]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm text-sm">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-slate-600">TMO: {payload[0].value} min</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text x={x + width / 2} y={y - 10} fill="#6b7280" fontSize={11} textAnchor="middle">
        {formatTimeHHMMSS(value)}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        
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
            <div className="p-3 bg-slate-100 text-slate-600 rounded-full">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">TMO Médio</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatTimeHHMMSS(tmoMedio)}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-full">
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
            <div className="p-3 bg-slate-100 text-slate-600 rounded-full">
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
            <div className="p-3 bg-slate-100 text-slate-600 rounded-full">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Esteiras Utilizadas</p>
              <h3 className="text-2xl font-bold text-gray-900">{selectedEsteiraFilter === 'all' ? esteiras.length : 1}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>TMO por Esteira</CardTitle>
          </CardHeader>
          <CardContent className="h-[380px] overflow-x-auto overflow-y-hidden">
            <div style={{ width: tmoPorEsteiraData.length > 4 ? `${tmoPorEsteiraData.length * 200}px` : '100%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tmoPorEsteiraData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} interval={0} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="TMO" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    <LabelList dataKey="ms" content={<CustomBarLabel />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>TMO Médio por Analista</CardTitle>
          </CardHeader>
          <CardContent className="h-[380px] overflow-x-auto overflow-y-hidden">
            <div style={{ width: tmoPorAnalistaData.length > 4 ? `${tmoPorAnalistaData.length * 200}px` : '100%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tmoPorAnalistaData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} interval={0} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="TMO" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    <LabelList dataKey="ms" content={<CustomBarLabel />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
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
                <p className="text-lg font-mono font-medium mt-1">{formatTimeHHMMSS(menorTempo)}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold">Maior Tempo</p>
                <p className="text-lg font-mono font-medium mt-1">{formatTimeHHMMSS(maiorTempo)}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold">Tempo Total Acumulado</p>
                <p className="text-lg font-mono font-medium mt-1">{formatTimeHHMMSS(totalTempo)}</p>
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
