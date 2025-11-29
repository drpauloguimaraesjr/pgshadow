import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { useState } from "react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: results, isLoading } = trpc.knowledge.search.useQuery(
    { query: searchQuery, limit: 20 },
    { enabled: searchQuery.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buscar Conhecimento</h1>
          <p className="text-muted-foreground mt-2">
            Encontre consultas similares rapidamente
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Busca Inteligente</CardTitle>
            <CardDescription>
              Digite palavras-chave ou perguntas para encontrar consultas relacionadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Ex: posso comer doce, substituir brócolis..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!query.trim() || isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SearchIcon className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {searchQuery && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Resultados para "{searchQuery}"
            </h2>
            <div className="space-y-3">
              {isLoading ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ) : results && results.length > 0 ? (
                results.map((entry) => {
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
                        </div>
                        {(entry.category || tags.length > 0) && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {entry.category && (
                              <Badge variant="secondary">{entry.category}</Badge>
                            )}
                            {tags.map((tag: string, idx: number) => (
                              <Badge key={idx} variant="outline">{tag}</Badge>
                            ))}
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
                      Nenhum resultado encontrado. Tente outras palavras-chave.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {!searchQuery && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Digite algo na busca acima para começar
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
