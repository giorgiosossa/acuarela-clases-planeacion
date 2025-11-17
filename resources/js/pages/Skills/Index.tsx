import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import { ArrowLeft, Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import SkillModal from '@/components/skill-modal';

interface Program {
    id: number;
    name: string;
}

interface Level {
    id: number;
    name: string;
    program_id: number;
    program: Program;
}

interface Skill {
    id: number;
    name: string;
    index: number;
    level_id: number;
}

interface Props {
    level: Level;
    skills: Skill[];
}

export default function Index({ level, skills: initialSkills }: Props) {
    const [skills, setSkills] = useState<Skill[]>(initialSkills);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

    const handleDelete = (id: number) => {
        router.delete(`/skills/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setSkills(skills.filter(s => s.id !== id));
            }
        });
    };

    const handleSkillSuccess = (skill: Skill) => {
        if (editingSkill) {
            setSkills(skills.map(s => s.id === skill.id ? skill : s));
        } else {
            setSkills([...skills, skill].sort((a, b) => a.index - b.index));
        }
        setEditingSkill(null);
    };

    const handleEdit = (skill: Skill) => {
        setEditingSkill(skill);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSkill(null);
    };

    const nextIndex = skills.length > 0
        ? Math.max(...skills.map(s => s.index)) + 1
        : 0;

    return (
        <AppLayout>
            <Head title={`Habilidades - ${level.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Button asChild variant="ghost">
                            <Link href="/levels">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver a Niveles
                            </Link>
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl">
                                        Habilidades de {level.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {level.program.name}
                                    </CardDescription>
                                </div>
                                <Button onClick={() => setIsModalOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar Habilidad
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead className="w-20">Orden</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {skills.length > 0 ? (
                                        skills.map((skill) => (
                                            <TableRow key={skill.id}>
                                                <TableCell>
                                                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {skill.index}
                                                </TableCell>
                                                <TableCell>{skill.name}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEdit(skill)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
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
                                                                        eliminará permanentemente la habilidad y todas
                                                                        sus sub-habilidades asociadas.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>
                                                                        Cancelar
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(skill.id)}
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
                                            <TableCell colSpan={4} className="text-center">
                                                No hay habilidades registradas para este nivel
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <SkillModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleSkillSuccess}
                levelId={level.id}
                skill={editingSkill}
                nextIndex={nextIndex}
            />
        </AppLayout>
    );
}
