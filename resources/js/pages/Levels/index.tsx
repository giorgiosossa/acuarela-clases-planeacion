
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Pencil, Trash2, } from 'lucide-react';


interface Program {
    id: number;
    name: string;
}

interface Level {
    id: number;
    name: string;
    program_id: number;
    swimmer_paraments: string | null;
    created_at: string;
    updated_at: string;
    program: Program;
}

interface PaginatedLevels {
    data: Level[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    levels: PaginatedLevels;
}

export default function Index({ levels }: Props) {
    const handleDelete = (id: number) => {
        router.delete(`/levels/${id}`, {
            preserveScroll: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get(`/levels?page=${page}`, {}, { preserveState: true });
    };

    return (
        <AppLayout

        >
            <Head title="Niveles" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Lista de Niveles</CardTitle>
                                    <CardDescription>
                                        Administra los niveles del programa
                                    </CardDescription>
                                </div>
                                <Link href="/levels/create">
                                    <Button>

                                        Nuevo Nivel
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Programa</TableHead>
                                        <TableHead>Parámetros</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {levels.data.length > 0 ? (
                                        levels.data.map((level) => (
                                            <TableRow key={level.id}>
                                                <TableCell className="font-medium">
                                                    {level.id}
                                                </TableCell>
                                                <TableCell>{level.name}</TableCell>
                                                <TableCell>{level.program.name}</TableCell>
                                                <TableCell>
                                                    {level.swimmer_paraments ? (
                                                        <span className="text-sm text-muted-foreground">
                                                            {level.swimmer_paraments.substring(0, 50)}
                                                            {level.swimmer_paraments.length > 50 && '...'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            Sin parámetros
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/levels/${level.id}/edit`}>
                                                            <Button variant="outline" size="sm">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="destructive" size="sm">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        ¿Estás seguro?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Esta acción no se puede deshacer. Esto
                                                                        eliminará permanentemente el nivel y todas
                                                                        sus habilidades asociadas.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>
                                                                        Cancelar
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(level.id)}
                                                                    >
                                                                        Eliminar
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                No hay niveles registrados
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {levels.last_page > 1 && (
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(levels.current_page - 1)}
                                        disabled={levels.current_page === 1}
                                    >
                                        Anterior
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Página {levels.current_page} de {levels.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(levels.current_page + 1)}
                                        disabled={levels.current_page === levels.last_page}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
