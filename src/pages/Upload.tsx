import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Upload as UploadIcon, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const uploadMutation = trpc.transcriptions.upload.useMutation();
  const processMutation = trpc.transcriptions.process.useMutation();
  const { data: transcriptions, refetch } = trpc.transcriptions.list.useQuery();
  const utils = trpc.useUtils();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Selecione um arquivo");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1];

        const result = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: base64Data,
          fileSize: file.size,
        });

        toast.success("Arquivo enviado com sucesso!");
        
        // Processar automaticamente
        toast.info("Processando transcrição...");
        const processResult = await processMutation.mutateAsync({ id: result.transcriptionId as number });
        
        toast.success(`${processResult.entriesExtracted} consultas extraídas!`);
        
        setFile(null);
        refetch();
        utils.knowledge.list.invalidate();
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar arquivo");
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "processing":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "failed":
        return "Falhou";
      case "processing":
        return "Processando";
      default:
        return "Pendente";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload de Transcrições</h1>
          <p className="text-muted-foreground mt-2">
            Envie arquivos de texto com transcrições de consultas
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enviar Arquivo</CardTitle>
            <CardDescription>
              Formatos aceitos: .txt, .doc, .docx. A IA irá extrair automaticamente perguntas e respostas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Arquivo de Transcrição</Label>
              <Input
                id="file"
                type="file"
                accept=".txt,.doc,.docx"
                onChange={handleFileChange}
                disabled={uploading}
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Arquivo selecionado: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Enviar e Processar
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4">Histórico de Uploads</h2>
          <div className="space-y-3">
            {transcriptions && transcriptions.length > 0 ? (
              transcriptions.map((t) => (
                <Card key={t.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(t.status)}
                        <div>
                          <CardTitle className="text-base">{t.fileName}</CardTitle>
                          <CardDescription>
                            {getStatusText(t.status)}
                            {t.entriesExtracted > 0 && ` • ${t.entriesExtracted} consultas extraídas`}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </CardHeader>
                  {t.errorMessage && (
                    <CardContent>
                      <p className="text-sm text-red-500">{t.errorMessage}</p>
                    </CardContent>
                  )}
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Nenhum upload ainda. Envie seu primeiro arquivo acima!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
