import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GripVertical, Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';

interface Skill {
    id: number;
    name: string;
    index: number;
    level_id: number;
}

interface Props {
    levelId: number;
    initialSkills: Skill[];
}

function SortableSkillItem({ skill, onEdit, onDelete }: {
    skill: Skill;
    onEdit: (skill: Skill) => void;
    onDelete: (id: number) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: skill.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex dark:bg-black items-center gap-2 p-3 bg-white border rounded-lg hover:border-primary transition-colors"
        >
            <button
                className="cursor-grab active:cursor-grabbing touch-none"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>
            <span className="flex font-medium w-1/3">{skill.index} </span>
            <span className="flex font-medium w-2/3">{skill.name} </span>


            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(skill)}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(skill.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export default function SkillsManager({ levelId, initialSkills }: Props) {
    const [skills, setSkills] = useState<Skill[]>(initialSkills);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [skillName, setSkillName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = skills.findIndex((s) => s.id === active.id);
            const newIndex = skills.findIndex((s) => s.id === over.id);

            const newSkills = arrayMove(skills, oldIndex, newIndex).map((skill, index) => ({
                ...skill,
                index,
            }));

            setSkills(newSkills);

            // Guardar nuevo orden en el backend
            try {
                await fetch('/skills/reorder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        skills: newSkills.map(s => ({ id: s.id, index: s.index })),
                    }),
                });
            } catch (error) {
                console.error('Error al reordenar:', error);
            }
        }
    };

    const handleCreateSkill = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/skills/modal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    name: skillName,
                    level_id: levelId,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSkills([...skills, result.skill]);
                setSuccessMessage(result.message);

                setTimeout(() => {
                    setIsCreateModalOpen(false);
                    setSkillName('');
                    setSuccessMessage('');
                }, 1500);
            } else {
                setError(result.errors?.name?.[0] || 'Error al crear la habilidad');
            }
        } catch (error) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSkill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSkill) return;

        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch(`/skills/${editingSkill.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ name: skillName }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSkills(skills.map(s => s.id === editingSkill.id ? result.skill : s));
                setSuccessMessage(result.message);

                setTimeout(() => {
                    setIsEditModalOpen(false);
                    setEditingSkill(null);
                    setSkillName('');
                    setSuccessMessage('');
                }, 1500);
            } else {
                setError(result.errors?.name?.[0] || 'Error al actualizar la habilidad');
            }
        } catch (error) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSkill = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta habilidad?')) return;

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        if (!csrfToken) {
            console.error('Token CSRF no encontrado');
            alert('Error: Token de seguridad no disponible');
            return;
        }

        try {
            const response = await fetch(`/skills/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                setSkills(skills.filter(s => s.id !== id));
            } else {
                console.error('Error en la respuesta:', response.status);
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
        }
    };

    const openCreateModal = () => {
        setSkillName('');
        setError('');
        setSuccessMessage('');
        setIsCreateModalOpen(true);
    };

    const openEditModal = (skill: Skill) => {
        setEditingSkill(skill);
        setSkillName(skill.name);
        setError('');
        setSuccessMessage('');
        setIsEditModalOpen(true);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Habilidades</CardTitle>
                            <CardDescription>
                                Arrastra para reordenar las habilidades
                            </CardDescription>
                        </div>
                        <Button onClick={openCreateModal}>
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Habilidad
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {skills.length > 0 ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={skills.map(s => s.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {skills.map((skill) => (
                                        <SortableSkillItem
                                            key={skill.id}
                                            skill={skill}
                                            onEdit={openEditModal}
                                            onDelete={handleDeleteSkill}
                                        />
                                    ))}
                                </div>
                            </SortableContext>

                        </DndContext>

                    ) : (
                        <p className="text-center text-muted-foreground py-8">
                            No hay habilidades agregadas aún
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Modal Crear */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Habilidad</DialogTitle>
                        <DialogDescription>
                            Agrega una nueva habilidad a este nivel
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSkill}>
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
                                <Label htmlFor="skill_name">
                                    Nombre de la Habilidad
                                    <span className="text-destructive ml-1">*</span>
                                </Label>
                                <Input
                                    id="skill_name"
                                    type="text"
                                    value={skillName}
                                    onChange={(e) => setSkillName(e.target.value)}
                                    placeholder="Ej: Respiración básica"
                                    className={error ? 'border-destructive' : ''}
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-sm text-destructive">{error}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creando...' : 'Crear Habilidad'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Editar */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Habilidad</DialogTitle>
                        <DialogDescription>
                            Modifica el nombre de la habilidad
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSkill}>
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
                                <Label htmlFor="edit_skill_name">
                                    Nombre de la Habilidad
                                    <span className="text-destructive ml-1">*</span>
                                </Label>
                                <Input
                                    id="edit_skill_name"
                                    type="text"
                                    value={skillName}
                                    onChange={(e) => setSkillName(e.target.value)}
                                    placeholder="Ej: Respiración básica"
                                    className={error ? 'border-destructive' : ''}
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-sm text-destructive">{error}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Actualizando...' : 'Actualizar Habilidad'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
