import { useState, FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
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
import { CheckCircle2 } from 'lucide-react';

interface Skill {
    id: number;
    name: string;
    index: number;
    level_id: number;
}

interface SkillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (skill: Skill) => void;
    levelId: number | null;
    skill?: Skill | null;
    nextIndex: number;
}

export default function SkillModal({
                                       isOpen,
                                       onClose,
                                       onSuccess,
                                       levelId,
                                       skill = null,
                                       nextIndex
                                   }: SkillModalProps) {
    const [name, setName] = useState(skill?.name || '');
    const [index, setIndex] = useState(skill?.index?.toString() || nextIndex.toString());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const isEditing = !!skill;

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!levelId && !isEditing) {
            setError('Debes guardar el nivel primero antes de agregar habilidades.');
            setIsSubmitting(false);
            return;
        }

        try {
            const url = isEditing ? `/skills/${skill.id}` : '/skills';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    name,
                    index: parseInt(index),
                    level_id: levelId || skill?.level_id
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSuccessMessage(result.message);
                onSuccess(result.skill);

                setTimeout(() => {
                    handleClose();
                }, 1500);
            } else {
                setError(result.errors?.name?.[0] || result.errors?.index?.[0] || 'Error al guardar la habilidad');
            }
        } catch (err) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setName('');
        setIndex(nextIndex.toString());
        setError('');
        setSuccessMessage('');
        onClose();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            handleClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar Habilidad' : 'Agregar Nueva Habilidad'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Modifica la información de la habilidad'
                            : 'Completa los datos para agregar una nueva habilidad al nivel'
                        }
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
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
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: Flotación básica"
                                className={error && error.includes('nombre') ? 'border-destructive' : ''}
                                autoFocus
                                disabled={isSubmitting || !!successMessage}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="skill_index">
                                Orden
                                <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Input
                                id="skill_index"
                                type="number"
                                min="0"
                                value={index}
                                onChange={(e) => setIndex(e.target.value)}
                                placeholder="0"
                                className={error && error.includes('orden') ? 'border-destructive' : ''}
                                disabled={isSubmitting || !!successMessage}
                            />
                            <p className="text-xs text-muted-foreground">
                                El orden determina la secuencia en que se muestran las habilidades
                            </p>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting || !!successMessage}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !!successMessage || !name.trim()}
                        >
                            {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Agregar Habilidad'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
