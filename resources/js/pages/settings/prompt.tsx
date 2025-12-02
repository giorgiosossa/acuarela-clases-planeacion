import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Prompt settings',
        href: '/settings/prompt',
    },
];

export default function Prompt({
    currentPrompt,
}: {
    currentPrompt?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Manually submitting form here since we are not using the controller helper object yet
        // Using inertia router or form helper would be better but let's stick to simple useForm or similar if available,
        // or just use the Form component with a manual route.
        // Actually, the example used `ProfileController.update.form()`. I don't have that generated.
        // So I will use `useForm` hook from inertia which is standard.
    };

    // Wait, the example used <Form {...ProfileController.update.form()} ...>
    // This implies a library like Ziggy or similar is generating these objects?
    // "laravel-wayfinder" seems to be in composer.json.

    // I'll stick to standard Inertia useForm to be safe.
    
    const { data, setData, patch, processing, errors, recentlySuccessful } = usePage<SharedData>().props as any; 
    // Wait, usePage returns shared props. I need useForm.
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Prompt Settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="AI Class Prompt"
                        description="Customize the instructions given to the AI when generating class plans."
                    />

                     <PromptForm currentPrompt={currentPrompt} />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

import { useForm } from '@inertiajs/react';

function PromptForm({ currentPrompt }: { currentPrompt?: string }) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        custom_prompt: currentPrompt || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch('/settings/prompt', {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-2">
                <Label htmlFor="custom_prompt">Custom Instructions</Label>
                <p className="text-sm text-muted-foreground">
                    Define your teaching style, available materials, or specific focus areas.
                    The system will automatically append the class structure (Introduction, Review, etc.) and student details.
                </p>
                <Textarea
                    id="custom_prompt"
                    className="mt-1 block w-full min-h-[200px]"
                    value={data.custom_prompt}
                    onChange={(e) => setData('custom_prompt', e.target.value)}
                    placeholder="Example: I want the classes to be very dynamic and use games. I have pull buoys and kickboards available. Focus on technique correction."
                />
                <InputError className="mt-2" message={errors.custom_prompt} />
            </div>

            <div className="flex items-center gap-4">
                <Button disabled={processing}>Save</Button>

                <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                >
                    <p className="text-sm text-neutral-600">Saved</p>
                </Transition>
            </div>
        </form>
    );
}
