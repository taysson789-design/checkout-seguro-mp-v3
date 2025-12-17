
import React, { useEffect, useState } from 'react';
import { GeneratedDocument } from '../types';
import { FileText, Clock, Trash2, ChevronUp, ChevronDown, Copy, Image as ImageIcon, Globe, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const History: React.FC = () => {
  const [history, setHistory] = useState<GeneratedDocument[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
        fetchHistory();
    } else {
        setLoading(false);
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

    if (!error && data) {
        const docs: GeneratedDocument[] = data.map(d => ({
            id: d.id,
            templateId: d.template_id,
            title: d.title,
            content: d.content,
            createdAt: d.created_at,
            previewSnippet: d.preview_snippet,
            type: d.type as any
        }));
        setHistory(docs);
    }
    setLoading(false);
  };

  const deleteDocument = async (id: string) => {
    if (confirm('Tem certeza que deseja apagar este documento?')) {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (!error) {
        setHistory(history.filter(h => h.id !== id));
      }
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Conteúdo copiado!');
  };

  const getIcon = (type?: string) => {
    switch (type) {
        case 'IMAGE': return <ImageIcon size={24} />;
        case 'SITE': return <Globe size={24} />;
        default: return <FileText size={24} />;
    }
  };

  if (loading) {
      return (
          <div className="flex justify-center items-center py-40">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto pt-32 pb-12 px-4 animate-fade-in min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-3xl font-bold text-white">Meus Arquivos</h1>
           <p className="text-slate-400 mt-1">Seus documentos salvos na nuvem.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-white/5 border-dashed animate-slide-up backdrop-blur-sm">
          <div className="w-16 h-16 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <FileText size={32} />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Nenhum arquivo ainda</h3>
          <p className="text-slate-400 mb-6">Comece agora a usar a consultoria inteligente.</p>
          <Link to="/">
            <Button className="shadow-lg shadow-indigo-900/50">Criar Novo</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((doc, index) => (
            <div 
              key={doc.id} 
              className={`bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 shadow-sm transition-all duration-300 ${expandedId === doc.id ? 'shadow-lg ring-1 ring-indigo-500/50' : 'hover:bg-slate-800/80 hover:translate-y-[-2px]'} animate-slide-up`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 cursor-pointer flex-grow" onClick={() => toggleExpand(doc.id)}>
                  <div className={`p-3 rounded-lg hidden sm:block transition-colors ${expandedId === doc.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                    {getIcon(doc.type)}
                  </div>
                  <div>
                    <h4 className={`font-bold text-lg transition-colors ${expandedId === doc.id ? 'text-indigo-400' : 'text-slate-200'}`}>{doc.title}</h4>
                    <div className="flex items-center text-xs text-slate-500 mt-1 mb-2">
                      <Clock size={12} className="mr-1" />
                      {new Date(doc.createdAt).toLocaleDateString()} às {new Date(doc.createdAt).toLocaleTimeString()}
                    </div>
                    {!expandedId && (
                      <p className="text-sm text-slate-400 line-clamp-2 max-w-xl">
                        {doc.type === 'SITE' ? 'Código HTML Gerado' : doc.previewSnippet}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 shrink-0">
                   <Button variant="outline" size="sm" onClick={() => toggleExpand(doc.id)} className="border-white/10 text-slate-300 hover:text-white">
                      {expandedId === doc.id ? 'Fechar' : 'Ver'} 
                      {expandedId === doc.id ? <ChevronUp size={14} className="ml-1"/> : <ChevronDown size={14} className="ml-1"/>}
                   </Button>
                   <Button variant="ghost" size="sm" onClick={() => deleteDocument(doc.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <Trash2 size={16} />
                   </Button>
                </div>
              </div>

              {/* Expanded Content View */}
              {expandedId === doc.id && (
                <div className="px-6 pb-6 pt-0 border-t border-white/5 animate-fade-in">
                  
                  {doc.type === 'IMAGE' ? (
                     <div className="py-4 flex flex-col items-center">
                         <img src={doc.content} alt={doc.title} className="max-w-full rounded-lg shadow-sm border border-slate-700 mb-4 max-h-[500px]" />
                         <a href={doc.content} download={`imagem-${doc.id}.png`}>
                           <Button size="sm">Baixar Imagem</Button>
                         </a>
                     </div>
                  ) : doc.type === 'SITE' ? (
                     <div className="py-4">
                         <div className="h-[400px] border border-slate-700 rounded-lg overflow-hidden mb-4 bg-white">
                             <iframe srcDoc={doc.content} className="w-full h-full" title="Site Preview" />
                         </div>
                         <Button size="sm" onClick={() => copyContent(doc.content)}>Copiar HTML</Button>
                     </div>
                  ) : (
                    <>
                      <div className="flex justify-end py-2">
                        <Button variant="ghost" size="sm" onClick={() => copyContent(doc.content)} className="text-indigo-400 hover:text-indigo-300">
                          <Copy size={14} className="mr-1" /> Copiar Tudo
                        </Button>
                      </div>
                      <div className="bg-slate-950/50 p-6 rounded-lg border border-white/5 overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-300 leading-relaxed">{doc.content}</pre>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
