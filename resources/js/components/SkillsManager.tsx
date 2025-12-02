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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Plus, Pencil, Trash2, CheckCircle2, Eye, Target, BookOpen, Dumbbell } from 'lucide-react';

interface Skill {
    id: number;
    name: string;
    index: number;
    level_id: number;
    objective?: string;
    description?: string;
    drills?: string;
}

interface Props {
    levelId: number;
    initialSkills: Skill[];
}

function SortableSkillItem({ skill, onEdit, onDelete, onView }: {
    skill: Skill;
    onEdit: (skill: Skill) => void;
    onDelete: (id: number) => void;
    onView: (skill: Skill) => void;
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
            className="flex dark:bg-black items-center gap-2 p-3 bg-white border rounded-lg hover:border-primary transition-colors group"
        >
            <button
                className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>
            
            <div 
                className="flex items-center gap-3 flex-1 cursor-pointer" 
                onClick={() => onView(skill)}
            >
                <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-full p-0">
                    {skill.index}
                </Badge>
                <div className="flex flex-col">
                     <span className="font-medium group-hover:text-primary transition-colors">{skill.name}</span>
                     {(skill.objective || skill.description) && (
                         <span className="text-xs text-muted-foreground flex items-center gap-1">
                             <Eye className="h-3 w-3" /> Ver detalles
                         </span>
                     )}
                </div>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onView(skill)}
                >
                    <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onEdit(skill)}
                >
                    <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-destructive/10"
                    onClick={() => onDelete(skill.id)}
                >
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        </div>
    );
}

export default function SkillsManager({ levelId, initialSkills }: Props) {
    const [skills, setSkills] = useState<Skill[]>(initialSkills);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [viewingSkill, setViewingSkill] = useState<Skill | null>(null);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        objective: '',
        description: '',
        drills: ''
    });

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
                    ...formData,
                    level_id: levelId,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSkills([...skills, result.skill]);
                setSuccessMessage(result.message);

                setTimeout(() => {
                    setIsCreateModalOpen(false);
                    setFormData({ name: '', objective: '', description: '', drills: '' });
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
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSkills(skills.map(s => s.id === editingSkill.id ? result.skill : s));
                setSuccessMessage(result.message);

                setTimeout(() => {
                    setIsEditModalOpen(false);
                    setEditingSkill(null);
                    setFormData({ name: '', objective: '', description: '', drills: '' });
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
        setFormData({ name: '', objective: '', description: '', drills: '' });
        setError('');
        setSuccessMessage('');
        setIsCreateModalOpen(true);
    };

    const openEditModal = (skill: Skill) => {
        setEditingSkill(skill);
        setFormData({
            name: skill.name,
            objective: skill.objective || '',
            description: skill.description || '',
            drills: skill.drills || ''
        });
        setError('');
        setSuccessMessage('');
        setIsEditModalOpen(true);
    };
    
    const openViewModal = (skill: Skill) => {
        setViewingSkill(skill);
        setIsViewModalOpen(true);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Habilidades</CardTitle>
                            <CardDescription>
                                Arrastra para reordenar. Haz clic en una habilidad para ver detalles.
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
                                            onView={openViewModal}
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
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Habilidad</DialogTitle>
                        <DialogDescription>
                            Define los detalles técnicos de la habilidad.
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
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Ej: Respiración básica"
                                    className={error ? 'border-destructive' : ''}
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-sm text-destructive">{error}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="skill_objective">Objetivo</Label>
                                <Textarea
                                    id="skill_objective"
                                    value={formData.objective}
                                    onChange={(e) => setFormData({...formData, objective: e.target.value})}
                                    placeholder="¿Qué se busca lograr con esta habilidad?"
                                    rows={2}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="skill_desc">Descripción Técnica</Label>
                                <Textarea
                                    id="skill_desc"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Detalles técnicos de la ejecución..."
                                    rows={3}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="skill_drills">Ejercicios Recomendados (Drills)</Label>
                                <Textarea
                                    id="skill_drills"
                                    value={formData.drills}
                                    onChange={(e) => setFormData({...formData, drills: e.target.value})}
                                    placeholder="Lista de ejercicios sugeridos para esta habilidad..."
                                    rows={3}
                                />
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
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Habilidad</DialogTitle>
                        <DialogDescription>
                            Modifica los detalles de la habilidad
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
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Ej: Respiración básica"
                                    className={error ? 'border-destructive' : ''}
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-sm text-destructive">{error}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_skill_objective">Objetivo</Label>
                                <Textarea
                                    id="edit_skill_objective"
                                    value={formData.objective}
                                    onChange={(e) => setFormData({...formData, objective: e.target.value})}
                                    placeholder="¿Qué se busca lograr con esta habilidad?"
                                    rows={2}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_skill_desc">Descripción Técnica</Label>
                                <Textarea
                                    id="edit_skill_desc"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Detalles técnicos de la ejecución..."
                                    rows={3}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="edit_skill_drills">Ejercicios Recomendados (Drills)</Label>
                                <Textarea
                                    id="edit_skill_drills"
                                    value={formData.drills}
                                    onChange={(e) => setFormData({...formData, drills: e.target.value})}
                                    placeholder="Lista de ejercicios sugeridos para esta habilidad..."
                                    rows={3}
                                />
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

             {/* Modal Ver Detalles */}
             <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-base px-2 py-0.5">{viewingSkill?.index}</Badge>
                             <DialogTitle className="text-xl">{viewingSkill?.name}</DialogTitle>
                        </div>
                        <DialogDescription>
                            Detalles completos de la habilidad
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <h4 className="flex items-center gap-2 font-semibold text-primary">
                                <Target className="h-4 w-4" /> Objetivo
                            </h4>
                            <p className="text-sm text-foreground/80 leading-relaxed bg-muted/40 p-3 rounded-md">
                                {viewingSkill?.objective || 'No definido'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="flex items-center gap-2 font-semibold text-primary">
                                <BookOpen className="h-4 w-4" /> Descripción Técnica
                            </h4>
                            <p className="text-sm text-foreground/80 leading-relaxed bg-muted/40 p-3 rounded-md">
                                {viewingSkill?.description || 'No definida'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="flex items-center gap-2 font-semibold text-primary">
                                <Dumbbell className="h-4 w-4" /> Ejercicios Recomendados
                            </h4>
                             <p className="text-sm text-foreground/80 leading-relaxed bg-muted/40 p-3 rounded-md whitespace-pre-wrap">
                                {viewingSkill?.drills || 'No definidos'}
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                         <Button
                            variant="outline"
                            onClick={() => {
                                setIsViewModalOpen(false);
                                if (viewingSkill) openEditModal(viewingSkill);
                            }}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                        <Button onClick={() => setIsViewModalOpen(false)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
