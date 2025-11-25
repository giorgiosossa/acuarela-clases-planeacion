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
import { FileDown, Search, ArrowLeft, Calendar, Clock, Users } from 'lucide-react';

interface Skill {
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

interface DateInMonth {
    day: string;
    date: string;
    day_number: number;
    formatted: number;
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
    month_name: string;
    month_year: string;
    dates_in_month: DateInMonth[];
    unique_skill_indexes: number[];
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

    // Función para calcular el skill index según la semana
    const getSkillIndexForDate = (baseIndexes: number[], dateIndex: number): string => {
        // Calcular en qué quincena estamos (cada 2 fechas = 1 quincena si hay 2 días por semana)
        // Si solo hay 1 día por semana, cada fecha es una semana
        const weeksElapsed = Math.floor(dateIndex / 4);

        // Sumar weeksElapsed a cada index base
        const adjustedIndexes = baseIndexes.map(index => index + weeksElapsed);

        return adjustedIndexes.join('-');
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

                            {/* Groups with Calendar */}
                            <div className="space-y-6">
                                {filteredGroups.length > 0 ? (
                                    filteredGroups.map((group) => (
                                        <Card key={group.id} className="overflow-hidden">
                                            {/* Group Header */}
                                            <CardHeader className="bg-transparent">
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                    <div className="space-y-2">
                                                        <CardTitle className="flex items-center gap-2 text-xl">
                                                            <Calendar className="h-5 w-5 text-primary" />
                                                            {group.days}
                                                        </CardTitle>
                                                        <div className="flex flex-wrap gap-2 text-sm">
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                {group.hour}
                                                            </span>
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">
                                                                {group.level?.name}
                                                            </span>

                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        <div className="font-semibold text-base text-foreground mb-1">
                                                            {group.month_name}
                                                        </div>

                                                    </div>
                                                </div>


                                            </CardHeader>

                                            {/* Calendar Table */}
                                            <CardContent className="p-0">
                                                <div className="overflow-x-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-32 bg-transparent">
                                                                    Día
                                                                </TableHead>
                                                                {group.dates_in_month.map((date, index) => (
                                                                    <TableHead
                                                                        key={index}
                                                                        className="text-center min-w-[80px] bg-transparent"
                                                                    >
                                                                        <div className="flex flex-col">
                                                                            <span className="font-semibold">
                                                                                {date.day}
                                                                            </span>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                {date.day_number}
                                                                            </span>
                                                                        </div>
                                                                    </TableHead>
                                                                ))}
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            <TableRow>
                                                                <TableCell className="font-semibold bg-transparent">
                                                                    Objetivos
                                                                </TableCell>
                                                                {group.dates_in_month.map((date, index) => {
                                                                    const skillIndexes = getSkillIndexForDate(
                                                                        group.unique_skill_indexes,
                                                                        index
                                                                    );

                                                                    // Determinar el color según la quincena
                                                                    const weekNumber = Math.floor(index / 2);
                                                                    const colors = [
                                                                        'bg-sky-100 text-sky-700',
                                                                        'bg-blue-100 text-blue-700',
                                                                        'bg-indigo-100 text-indigo-700',
                                                                        'bg-cyan-100 text-cyan-700',
                                                                        'bg-blue-200 text-blue-800',
                                                                    ];
                                                                    const colorClass = colors[weekNumber % colors.length];

                                                                    return (
                                                                        <TableCell
                                                                            key={index}
                                                                            className="text-center"
                                                                        >
                                                                            <div className={`inline-flex items-center justify-center min-w-[60px] px-3 py-1.5 rounded-md ${colorClass} font-semibold text-sm`}>
                                                                                {skillIndexes}
                                                                            </div>
                                                                        </TableCell>
                                                                    );
                                                                })}
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <Card>
                                        <CardContent className="py-12">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <Calendar className="h-12 w-12 mb-4" />
                                                <p className="text-lg font-medium">No se encontraron resultados</p>
                                                <p className="text-sm">
                                                    {searchTerm
                                                        ? 'Intenta con otro término de búsqueda'
                                                        : 'No hay grupos registrados aún'
                                                    }
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
