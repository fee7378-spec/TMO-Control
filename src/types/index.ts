export interface Esteira {
  id?: string;
  nome: string;
  descricao: string;
  status: 'Ativa' | 'Inativa';
  createdAt: number;
  updatedAt: number;
}

export interface Analista {
  id?: string;
  nome: string;
  createdAt: number;
}

export interface Medicao {
  id?: string;
  esteiraId: string;
  analistaId: string;
  tempoEmMilissegundos: number;
  tempoFormatado: string;
  horaInicio: number;
  horaFim: number;
  observacao: string;
  createdAt: number;
}
