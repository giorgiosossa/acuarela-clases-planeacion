import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SkillsManager from '@/components/SkillsManager';

interface Program {
    id: number;
    name: string;
}

interface Skill {
    id: number;
    name: string;
    index: number;
    level_id: number;
}

interface Level {
    id: number;
    name: string;
    program_id: number;
    swimmer_paraments: string | null;
    program: Program;
}

interface Props {
    level: Level;
    programs: Program[];
    skills: Skill[];
    canCreateProgram?: boolean;
}

export default function Edit({ level, programs: initialPrograms, skills, canCreateProgram = true }: Props) {
    const [programs, setPrograms] = useState<Program[]>(initialPrograms);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreatingProgram, setIsCreatingProgram] = useState(false);
    const [newProgramName, setNewProgramName] = useState('');
    const [programError, setProgramError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const { data, setData, put, processing, errors } = useForm({
        name: level.name,
        program_id: level.program_id.toString(),
        swimmer_paraments: level.swimmer_paraments || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/levels/${level.id}`);
    };

    const handleCreateProgram = async (e: React.FormEvent) => {
        e.preventDefault();
        setProgramError('');
        setIsCreatingProgram(true);

        try {
            const response = await fetch('/programs/modal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ name: newProgramName }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const newProgram = result.program;
                setPrograms([...programs, newProgram]);
                setData('program_id', newProgram.id.toString());
                setSuccessMessage(result.message);

                setTimeout(() => {
                    setIsModalOpen(false);
                    setNewProgramName('');
                    setSuccessMessage('');
                }, 1500);
            } else {
                setProgramError(result.errors?.name?.[0] || 'Error al crear el programa');
            }
        } catch (error) {
            setProgramError('Error de conexión. Intenta nuevamente.');
        } finally {
            setIsCreatingProgram(false);
        }
    };

    const handleOpenModal = () => {
        setNewProgramName('');
        setProgramError('');
        setSuccessMessage('');
        setIsModalOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Editar Nivel" />

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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Formulario de edición del nivel */}
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl">Editar Nivel</CardTitle>
                                    <CardDescription>
                                        Modifica la información del nivel
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={submit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Nombre del Nivel
                                                <span className="text-destructive ml-1">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Ej: Nivel 1"
                                                className={errors.name ? 'border-destructive' : ''}
                                                autoFocus
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-destructive">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="program_id">
                                                    Programa
                                                    <span className="text-destructive ml-1">*</span>
                                                </Label>
                                                {canCreateProgram && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleOpenModal}
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Crear Programa
                                                    </Button>
                                                )}
                                            </div>
                                            <Select
                                                value={data.program_id}
                                                onValueChange={(value) => setData('program_id', value)}
                                            >
                                                <SelectTrigger
                                                    className={errors.program_id ? 'border-destructive' : ''}
                                                >
                                                    <SelectValue placeholder="Selecciona un programa" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {programs.length > 0 ? (
                                                        programs.map((program) => (
                                                            <SelectItem
                                                                key={program.id}
                                                                value={program.id.toString()}
                                                            >
                                                                {program.name}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="p-2 text-sm text-muted-foreground">
                                                            No hay programas disponibles
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors.program_id && (
                                                <p className="text-sm text-destructive">
                                                    {errors.program_id}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="swimmer_paraments">
                                                Parámetros del Nadador
                                            </Label>
                                            <Textarea
                                                id="swimmer_paraments"
                                                value={data.swimmer_paraments}
                                                onChange={(e) =>
                                                    setData('swimmer_paraments', e.target.value)
                                                }
                                                placeholder="Describe los parámetros del nadador para este nivel..."
                                                rows={5}
                                                className={errors.swimmer_paraments ? 'border-destructive' : ''}
                                            />
                                            {errors.swimmer_paraments && (
                                                <p className="text-sm text-destructive">
                                                    {errors.swimmer_paraments}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-end gap-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                asChild
                                            >
                                                <Link href="/levels">
                                                    Cancelar
                                                </Link>
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                {processing ? 'Actualizando...' : 'Actualizar Nivel'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Gestión de habilidades */}
                        <div>
                            <SkillsManager levelId={level.id} initialSkills={skills} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para crear programa */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Programa</DialogTitle>
                        <DialogDescription>
                            Agrega un nuevo programa de natación
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateProgram}>
                        <div className="space-y-4 py-4">
                            {successMessage && (
                                <Alert className="border-green-500 bg-green-50">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800">
                                        {successMessage}
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="program_name">
                                    Nombre del Programa
                                    <span className="text-destructive ml-1">*</span>
                                </Label>
                                <Input
                                    id="program_name"
                                    type="text"
                                    value={newProgramName}
                                    onChange={(e) => setNewProgramName(e.target.value)}
                                    placeholder="Ej: Programa Infantil"
                                    className={programError ? 'border-destructive' : ''}
                                    autoFocus
                                />
                                {programError && (
                                    <p className="text-sm text-destructive">
                                        {programError}
                                    </p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                disabled={isCreatingProgram}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isCreatingProgram}>
                                {isCreatingProgram ? 'Creando...' : 'Crear Programa'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
