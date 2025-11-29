import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Knowledge() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  
  const { data: entries, refetch } = trpc.knowledge.list.useQuery({});
  const createMutation = trpc.knowledge.create.useMutation();
  const updateMutation = trpc.knowledge.update.useMutation();
  const deleteMutation = trpc.knowledge.delete.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          question,
          answer,
          category: category || undefined,
        });
        toast.success("Consulta atualizada!");
      } else {
        await createMutation.mutateAsync({
          question,
          answer,
          category: category || undefined,
        });
        toast.success("Consulta criada!");
      }
      
      setOpen(false);
      resetForm();
      utils.knowledge.list.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar");
    }
  };

  const handleEdit = (entry: any) => {
    setEditingId(entry.id);
    setQuestion(entry.question);
    setAnswer(entry.answer);
    setCategory(entry.category || "");
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta consulta?")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Consulta excluída!");
      utils.knowledge.list.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setQuestion("");
    setAnswer("");
    setCategory("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Base de Conhecimento</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie todas as consultas cadastradas
            </p>
          </div>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Consulta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar" : "Nova"} Consulta</DialogTitle>
                <DialogDescription>
                  Adicione ou edite uma entrada na base de conhecimento
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Pergunta</Label>
                  <Input
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ex: Posso comer doce?"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="answer">Resposta</Label>
                  <Textarea
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Resposta detalhada..."
                    rows={6}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria (opcional)</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: duvida_alimentacao"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingId ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {entries && entries.length > 0 ? (
            entries.map((entry) => {
              const tags = entry.tags ? JSON.parse(entry.tags) : [];
              return (
                <Card key={entry.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-base mb-2">{entry.question}</CardTitle>
                        <CardDescription className="whitespace-pre-wrap">
                          {entry.answer}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {(entry.category || tags.length > 0) && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {entry.category && (
                          <Badge variant="secondary">{entry.category}</Badge>
                        )}
                        {tags.map((tag: string, idx: number) => (
                          <Badge key={idx} variant="outline">{tag}</Badge>
                        ))}
                        <Badge variant="outline" className="ml-auto">
                          {entry.sourceType}
                        </Badge>
                      </div>
                    )}
                  </CardHeader>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Nenhuma consulta ainda. Crie uma manualmente ou faça upload de uma transcrição!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
