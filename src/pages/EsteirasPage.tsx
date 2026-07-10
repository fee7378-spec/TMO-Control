import React, { useState } from 'react';
import { useListVals } from 'react-firebase-hooks/database';
import { esteirasRef, push, set, remove, ref, db } from '../db/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label, Select } from '../components/ui/Input';
import { formatDateTime } from '../utils';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import type { Esteira } from '../types';

export function EsteirasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<Partial<Esteira> | null>(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', status: 'Ativa' as 'Ativa'|'Inativa' });

  const [esteirasDocs, loading, error] = useListVals<Esteira>(esteirasRef, { keyField: 'id' });
  const esteiras = esteirasDocs || [];

  const filteredEsteiras = esteiras?.filter(e => e.nome.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;
    
    const now = Date.now();
    if (isEditing?.id) {
      await set(ref(db, `esteiras/${isEditing.id}`), { ...formData, updatedAt: now, createdAt: isEditing.createdAt || now });
    } else {
      const newRef = push(esteirasRef);
      await set(newRef, { ...formData, createdAt: now, updatedAt: now });
    }
    
    setFormData({ nome: '', descricao: '', status: 'Ativa' });
    setIsEditing(null);
  };

  const handleEdit = (esteira: Esteira) => {
    setIsEditing(esteira);
    setFormData({ nome: esteira.nome, descricao: esteira.descricao, status: esteira.status });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta esteira?')) {
      await remove(ref(db, `esteiras/${id}`));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gestão de Esteiras</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Editar Esteira' : 'Nova Esteira'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Esteira</Label>
                  <Input id="nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição (Opcional)</Label>
                  <Input id="descricao" value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select id="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as 'Ativa'|'Inativa'})}>
                    <option value="Ativa">Ativa</option>
                    <option value="Inativa">Inativa</option>
                  </Select>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button type="submit" className="flex-1">{isEditing ? 'Atualizar' : 'Salvar'}</Button>
                  {isEditing && <Button type="button" variant="outline" onClick={() => { setIsEditing(null); setFormData({ nome: '', descricao: '', status: 'Ativa' }) }}>Cancelar</Button>}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Esteiras Cadastradas</CardTitle>
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
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Criada em</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-500">Carregando...</td></tr>
                    ) : filteredEsteiras.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-500">Nenhuma esteira encontrada.</td></tr>
                    ) : filteredEsteiras.map((esteira) => (
                      <tr key={esteira.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{esteira.nome}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${esteira.status === 'Ativa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {esteira.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">{formatDateTime(esteira.createdAt)}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(esteira)}><Edit2 className="h-4 w-4 text-blue-600" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(esteira.id!)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
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
