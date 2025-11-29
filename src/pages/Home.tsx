import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Database, Upload, Search, FileText, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: entries } = trpc.knowledge.list.useQuery({ limit: 5 });
  const { data: categories } = trpc.categories.list.useQuery();

  const stats = [
    {
      title: "Total de Consultas",
      value: entries?.length || 0,
      icon: Database,
      description: "Entradas na base de conhecimento",
    },
    {
      title: "Categorias",
      value: categories?.length || 0,
      icon: FileText,
      description: "Categorias organizadas",
    },
    {
      title: "Crescimento",
      value: "+12%",
      icon: TrendingUp,
      description: "Últimos 30 dias",
    },
  ];

  const quickActions = [
    {
      title: "Upload de Transcrição",
      description: "Envie arquivos de consultas para processamento automático",
      icon: Upload,
      href: "/upload",
      color: "text-blue-500",
    },
    {
      title: "Buscar Conhecimento",
      description: "Encontre consultas similares rapidamente",
      icon: Search,
      href: "/search",
      color: "text-green-500",
    },
    {
      title: "Ver Todas Consultas",
      description: "Navegue por toda sua base de conhecimento",
      icon: Database,
      href: "/knowledge",
      color: "text-purple-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PGshadow</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de base de conhecimento profissional
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardHeader>
                      <Icon className={`h-8 w-8 ${action.color} mb-2`} />
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Consultas Recentes</h2>
            <Button variant="outline" asChild>
              <Link href="/knowledge">Ver Todas</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {entries && entries.length > 0 ? (
              entries.map((entry) => (
                <Card key={entry.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{entry.question}</CardTitle>
                    <CardDescription className="line-clamp-2">{entry.answer}</CardDescription>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Nenhuma consulta ainda. Comece fazendo upload de uma transcrição!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Como Começar</CardTitle>
            <CardDescription>
              Siga estes passos para começar a usar o PGshadow:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Faça upload de transcrições</p>
                <p className="text-sm text-muted-foreground">
                  Envie arquivos de texto com suas consultas
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Processamento automático</p>
                <p className="text-sm text-muted-foreground">
                  A IA extrai perguntas e respostas automaticamente
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Use em outros projetos</p>
                <p className="text-sm text-muted-foreground">
                  Integre via API ou webhooks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
