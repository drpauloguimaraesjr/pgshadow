import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Copy, Key, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
    const [newKeyName, setNewKeyName] = useState("");
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);

    const utils = trpc.useContext();
    const { data: keys, isLoading } = trpc.apiKeys.list.useQuery();

    const createMutation = trpc.apiKeys.create.useMutation({
        onSuccess: (data) => {
            setGeneratedKey(data.key);
            setNewKeyName("");
            utils.apiKeys.list.invalidate();
            toast.success("Chave de API criada com sucesso!");
        },
        onError: (error) => {
            toast.error(`Erro ao criar chave: ${error.message}`);
        }
    });

    const revokeMutation = trpc.apiKeys.revoke.useMutation({
        onSuccess: () => {
            utils.apiKeys.list.invalidate();
            toast.success("Chave revogada com sucesso.");
        },
        onError: (error) => {
            toast.error(`Erro ao revogar chave: ${error.message}`);
        }
    });

    const handleCreateKey = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;
        createMutation.mutate({ name: newKeyName });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado para a área de transferência!");
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                    <p className="text-muted-foreground mt-2">
                        Gerencie suas chaves de API e preferências.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Chaves de API
                        </CardTitle>
                        <CardDescription>
                            Use estas chaves para autenticar requisições de sistemas externos como n8n.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {generatedKey && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 p-4 rounded-lg mb-6">
                                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Nova chave gerada!</h4>
                                <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                                    Copie esta chave agora. Você não poderá vê-la novamente.
                                </p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-white dark:bg-black/20 p-2 rounded border border-green-200 dark:border-green-800 font-mono text-sm break-all">
                                        {generatedKey}
                                    </code>
                                    <Button size="icon" variant="outline" onClick={() => copyToClipboard(generatedKey)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleCreateKey} className="flex gap-2 items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium">Nome da Chave</label>
                                <Input
                                    placeholder="Ex: n8n Production"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                />
                            </div>
                            <Button type="submit" disabled={createMutation.isLoading || !newKeyName.trim()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Gerar Nova Chave
                            </Button>
                        </form>

                        <div className="space-y-4 mt-6">
                            <h3 className="text-sm font-medium text-muted-foreground">Chaves Ativas</h3>

                            {isLoading ? (
                                <div className="space-y-2">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                                    ))}
                                </div>
                            ) : keys?.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">Nenhuma chave criada ainda.</p>
                            ) : (
                                <div className="space-y-3">
                                    {keys?.map((key) => (
                                        <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                                            <div>
                                                <p className="font-medium">{key.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                                        {key.prefix}...
                                                    </code>
                                                    <span className="text-xs text-muted-foreground">
                                                        Criada em {new Date(key.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => {
                                                    if (confirm("Tem certeza que deseja revogar esta chave? O acesso será bloqueado imediatamente.")) {
                                                        revokeMutation.mutate({ id: key.id });
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
