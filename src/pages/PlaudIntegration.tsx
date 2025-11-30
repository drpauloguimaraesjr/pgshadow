import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Download, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PlaudIntegration() {
    const [clientId, setClientId] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

    const testMutation = trpc.plaud.testConnection.useMutation({
        onSuccess: (data) => {
            if (data.success) {
                setIsConnected(true);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        },
    });

    const { data: files, refetch, isLoading } = trpc.plaud.listFiles.useQuery(
        { clientId, secretKey },
        { enabled: isConnected }
    );

    const importMutation = trpc.plaud.importFile.useMutation({
        onSuccess: (data) => {
            toast.success(`${data.entriesCreated} entradas criadas de "${data.fileName}"`);
            setSelectedFiles(new Set());
        },
        onError: (error) => {
            toast.error(`Erro ao importar: ${error.message}`);
        },
    });

    const handleTest = () => {
        if (!clientId || !secretKey) {
            toast.error("Preencha Client ID e Secret Key");
            return;
        }
        testMutation.mutate({ clientId, secretKey });
    };

    const handleImport = (fileId: string) => {
        importMutation.mutate({ clientId, secretKey, fileId });
    };

    const handleImportSelected = () => {
        selectedFiles.forEach(fileId => {
            importMutation.mutate({ clientId, secretKey, fileId });
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Integração Plaud Note</h1>
                    <p className="text-muted-foreground mt-2">
                        Importe transcrições automaticamente do seu dispositivo Plaud Note
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Configuração</CardTitle>
                        <CardDescription>
                            Configure suas credenciais da API do Plaud Note
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Client ID</label>
                            <Input
                                placeholder="Seu Client ID do Plaud Note"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                disabled={isConnected}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Secret Key</label>
                            <Input
                                type="password"
                                placeholder="Sua Secret Key do Plaud Note"
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                disabled={isConnected}
                            />
                        </div>

                        <div className="flex gap-2">
                            {!isConnected ? (
                                <Button
                                    onClick={handleTest}
                                    disabled={testMutation.isLoading}
                                >
                                    {testMutation.isLoading ? "Testando..." : "Testar Conexão"}
                                </Button>
                            ) : (
                                <>
                                    <Button variant="outline" onClick={() => setIsConnected(false)}>
                                        Desconectar
                                    </Button>
                                    <Button variant="outline" onClick={() => refetch()}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Atualizar
                                    </Button>
                                </>
                            )}
                        </div>

                        {isConnected && (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Conectado com sucesso
                            </div>
                        )}
                    </CardContent>
                </Card>

                {isConnected && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Arquivos Disponíveis</CardTitle>
                                    <CardDescription>
                                        Selecione os arquivos para importar
                                    </CardDescription>
                                </div>
                                {selectedFiles.size > 0 && (
                                    <Button onClick={handleImportSelected}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Importar Selecionados ({selectedFiles.size})
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                                    ))}
                                </div>
                            ) : files?.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic text-center py-8">
                                    Nenhum arquivo encontrado
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {files?.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFiles.has(file.id)}
                                                    onChange={(e) => {
                                                        const newSelected = new Set(selectedFiles);
                                                        if (e.target.checked) {
                                                            newSelected.add(file.id);
                                                        } else {
                                                            newSelected.delete(file.id);
                                                        }
                                                        setSelectedFiles(newSelected);
                                                    }}
                                                    className="h-4 w-4"
                                                />
                                                <div>
                                                    <p className="font-medium">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(file.created_at).toLocaleDateString()} • {Math.floor(file.duration / 60)}min
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {file.transcription ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleImport(file.id)}
                                                    disabled={!file.transcription || importMutation.isLoading}
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Importar
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
