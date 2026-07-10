import React, { useState } from 'react';
import { useListVals } from 'react-firebase-hooks/database';
import { analistasRef, push, set, remove, ref, db } from '../db/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';
import { formatDateTime } from '../utils';
import { Edit2, Trash2, Search } from 'lucide-react';
import type { Analista } from '../types';

export function AnalistasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<Partial<Analista> | null>(null);
  const [formData, setFormData] = useState({ nome: '' });

  const [analistasDocs, loading, error] = useListVals<Analista>(analistasRef, { keyField: 'id' });
  const analistas = analistasDocs || [];

  const filteredAnalistas = analistas?.filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;
    
    const now = Date.now();
    if (isEditing?.id) {
      await set(ref(db, `analistas/${isEditing.id}`), { ...formData, createdAt: isEditing.createdAt || now });
    } else {
      const newRef = push(analistasRef);
      await set(newRef, { ...formData, createdAt: now });
    }
    
    setFormData({ nome: '' });
    setIsEditing(null);
  };

  const handleEdit = (analista: Analista) => {
    setIsEditing(analista);
    setFormData({ nome: analista.nome });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este analista?')) {
      await remove(ref(db, `analistas/${id}`));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gestão de Analistas</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Editar Analista' : 'Novo Analista'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button type="submit" className="flex-1">{isEditing ? 'Atualizar' : 'Salvar'}</Button>
                  {isEditing && <Button type="button" variant="outline" onClick={() => { setIsEditing(null); setFormData({ nome: '' }) }}>Cancelar</Button>}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Analistas Cadastrados</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Pesquisar por nome..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3">Nome</th>
                      <th className="px-4 py-3">Criado em</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-500">Carregando...</td></tr>
                    ) : filteredAnalistas.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-500">Nenhum analista encontrado.</td></tr>
                    ) : filteredAnalistas.map((analista) => (
                      <tr key={analista.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{analista.nome}</td>
                        <td className="px-4 py-3">{formatDateTime(analista.createdAt)}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(analista)}><Edit2 className="h-4 w-4 text-blue-600" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(analista.id!)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
