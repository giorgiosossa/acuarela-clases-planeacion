import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Clock, TrendingUp, ArrowRight, FileText } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardStats {
    totalGroups: number;
    totalSwimmers: number;
    activeClasses: number;
    upcomingClasses: number;
}

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

interface Group {
    id: number;
    hour_start: string;
    days: string;
    note: string;
    level_id: number;
    level: Level;
    swimmers: Swimmer[];
    created_at: string;
    month_name: string;
    month_year: string;
    dates_in_month: any[];
    unique_skill_indexes: number[];
    max_skill_index: number;
}

interface Props {
    stats?: DashboardStats;
    groups?: Group[];
}

export default function Dashboard({ stats, groups = [] }: Props) {
    // Datos de ejemplo si no vienen del backend
    const dashboardStats = stats || {
        totalGroups: 12,
        totalSwimmers: 156,
        activeClasses: 8,
        upcomingClasses: 24,
    };

    const formatTime = (time: string) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total de Grupos
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardStats.totalGroups}</div>
                            <p className="text-xs text-muted-foreground">
                                Grupos activos este mes
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total de Nadadores
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardStats.totalSwimmers}</div>
                            <p className="text-xs text-muted-foreground">
                                Nadadores registrados
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Clases Activas
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardStats.activeClasses}</div>
                            <p className="text-xs text-muted-foreground">
                                Clases en progreso hoy
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabla de Grupos */}
                <Card className="relative min-h-[100vh] flex-1 overflow-hidden md:min-h-min">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle className="text-xl">Grupos Activos</CardTitle>
                                <CardDescription className="mt-1">
                                    Resumen de todos los grupos y sus detalles
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/groups/report">
                                    Ver Reporte Completo
                                    <FileText className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {groups.length > 0 ? (
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Días</TableHead>
                                            <TableHead>Horario</TableHead>
                                            <TableHead>Nivel</TableHead>
                                            {/* Columnas dinámicas para cada fecha del mes */}
                                            {groups[0]?.dates_in_month && groups[0].dates_in_month.slice(0, 8).map((date, index) => (
                                                <TableHead key={index} className="text-center min-w-[80px]">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-xs">
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
                                        {groups.map((group) => (
                                            <TableRow key={group.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        {group.days}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="font-medium">{formatTime(group.hour_start)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary text-sm font-medium">
                                                        {group.level?.name || 'Sin nivel'}
                                                    </span>
                                                </TableCell>
                                                {/* Celdas con skill indexes por fecha */}
                                                {group.dates_in_month && group.dates_in_month.slice(0, 8).map((date, index) => {
                                                    const weeksElapsed = Math.floor(index / 4);
                                                    const adjustedIndexes = (group.unique_skill_indexes || []).map(idx => idx + weeksElapsed);
                                                    const validIndexes = adjustedIndexes.filter(idx => idx <= (group.max_skill_index || 0));
                                                    const hasExceeded = adjustedIndexes.length > validIndexes.length;
                                                    const skillIndexes = validIndexes.length === 0 ? 'EV' :
                                                        hasExceeded ? `${validIndexes.join('-')}-EV` : validIndexes.join('-');

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
                                                        <TableCell key={index} className="text-center">
                                                            <div className={`inline-flex items-center justify-center min-w-[60px] px-2 py-1 rounded-md ${colorClass} font-semibold text-xs`}>
                                                                {skillIndexes}
                                                            </div>
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Calendar className="h-12 w-12 mb-4" />
                                <p className="text-lg font-medium">No hay grupos para mostrar</p>
                                <p className="text-sm">Los grupos aparecerán aquí una vez que los crees</p>
                                <Button asChild className="mt-4" variant="outline">
                                    <Link href="/groups">
                                        Crear Grupo
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
