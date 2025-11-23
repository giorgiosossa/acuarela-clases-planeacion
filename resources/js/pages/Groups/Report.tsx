import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { FileDown, Search, ArrowLeft } from 'lucide-react';

interface Skill{
    name: string;
    index: number;
}
interface Level {
    id: number;
    name: string;
}
interface Swimmer {
    name: string;
    current_skill: Skill;
}
interface Group {
    id: number;
    hour: string;
    days: string;
    note: string;
    level_id: number;
    level: Level;
    swimmers: Swimmer[];
    created_at: string;
}

interface Props {
    groups: Group[];
}

export default function Report({ groups: initialGroups }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGroups = initialGroups.filter(group =>
        group.hour?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.days?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.level?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.note?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExportPdf = () => {
        window.location.href = '/groups/export-pdf';
    };

    return (
        <AppLayout>
            <Head title="Reporte de Grupos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <Button asChild variant="ghost">
                            <Link href="/groups">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver a Grupos
                            </Link>
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <CardTitle className="text-2xl">Reporte de Grupos</CardTitle>
                                    <CardDescription className="mt-1">
                                        Visualiza y exporta la información completa de todos tus grupos
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={handleExportPdf}
                                    className="gap-2"
                                    variant="destructive"
                                >
                                    <FileDown className="h-4 w-4" />
                                    Exportar PDF
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {/* Search Bar */}
                            <div className="mb-6">
                                <div className="relative max-w-sm">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        type="text"
                                        placeholder="Buscar grupos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Mostrando {filteredGroups.length} de {initialGroups.length} grupos
                                </p>
                            </div>

                            {/* Table */}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>

                                            <TableHead>Hora</TableHead>
                                            <TableHead>Días</TableHead>
                                            <TableHead>Nivel</TableHead>

                                            <TableHead>Objetivos</TableHead>

                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredGroups.length > 0 ? (
                                            filteredGroups.map((group) => (
                                                <TableRow key={group.id}>

                                                    <TableCell className="font-semibold">
                                                        {group.hour}
                                                    </TableCell>
                                                    <TableCell>
                                                        {group.days}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                                                            {group.level?.name}
                                                        </span>
                                                    </TableCell>


                                                    <TableCell>
                                                        {[...new Set(
                                                        group.swimmers.map((swimmer) => swimmer.current_skill.index + 1)
                                                        )].join('-')}

                                                    </TableCell>

                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">
                                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                        <p className="text-lg font-medium">No se encontraron resultados</p>
                                                        <p className="text-sm">
                                                            {searchTerm
                                                                ? 'Intenta con otro término de búsqueda'
                                                                : 'No hay grupos registrados aún'
                                                            }
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
