
"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { DataTable } from "./data-table"
import type { ClassFacultyMapping, Faculty } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useAuth } from "@/hooks/use-auth"

interface ClassFacultyMappingTableProps {
}

const mappingSchema = z.object({
    id: z.string().optional(),
    class_name: z.string().min(1, "Class name is required."),
    faculty_id: z.string().min(1, "Faculty must be selected."),
    subject: z.string().min(1, "Subject is required."),
});

const MappingForm = ({ mapping, onSave, onCancel }: { mapping?: ClassFacultyMapping; onSave: (data: Omit<ClassFacultyMapping, 'id'>) => void; onCancel: () => void; }) => {
    const { mappings, faculty } = useAuth();

    const existingMappings = React.useMemo(() => new Set(mappings.map(m => `${m.class_name}-${m.faculty_id}-${m.subject}`)), [mappings]);
    
    const formSchema = mappingSchema.refine(data => {
        const mappingKey = `${data.class_name}-${data.faculty_id}-${data.subject}`;
        if (mapping?.id && `${mapping.class_name}-${mapping.faculty_id}-${mapping.subject}` === mappingKey) return true;
        return !existingMappings.has(mappingKey);
    }, {
        message: "This exact mapping already exists.",
        path: ["subject"], // Show error on a field
    });
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: mapping || { class_name: "", faculty_id: "", subject: "" },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const { id, ...data } = values;
        onSave(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="class_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Class Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., CS-A" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="faculty_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Faculty</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a faculty member" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {faculty.map(f => (
                                <SelectItem key={f.id} value={f.faculty_id}>{f.name} ({f.faculty_id})</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Data Structures" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};


const ActionsCell = ({ mapping }: { mapping: ClassFacultyMapping; }) => {
    const { updateMapping, deleteMapping } = useAuth();
    const [isEditing, setIsEditing] = React.useState(false);
    const { toast } = useToast();

    const handleEditSave = (data: Omit<ClassFacultyMapping, 'id'>) => {
        updateMapping(mapping.id, data);
        toast({ title: "Mapping Updated" });
        setIsEditing(false);
    };
    
    const handleDelete = () => {
        if(confirm(`Are you sure you want to delete this mapping?`)) {
            deleteMapping(mapping.id);
            toast({ title: "Mapping Deleted" });
        }
    };
  
    return (
     <>
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setIsEditing(true)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Mapping</DialogTitle>
                    <DialogDescription>Update this class-faculty mapping.</DialogDescription>
                </DialogHeader>
                <MappingForm mapping={mapping} onSave={handleEditSave} onCancel={() => setIsEditing(false)} />
            </DialogContent>
        </Dialog>
     </>
    );
};

const getColumns = (allFaculty: Faculty[]): ColumnDef<ClassFacultyMapping>[] => [
  {
    accessorKey: "class_name",
    header: "Class Name",
  },
  {
    accessorKey: "faculty_id",
    header: "Faculty",
    cell: ({ row }) => {
        const faculty = allFaculty.find(f => f.faculty_id === row.original.faculty_id);
        return faculty ? `${faculty.name} (${faculty.faculty_id})` : row.original.faculty_id;
    }
  },
  {
    accessorKey: "subject",
    header: "Subject",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell mapping={row.original} />,
  },
]

export function ClassFacultyMappingTable({}: ClassFacultyMappingTableProps) {
    const { mappings, faculty, addMapping } = useAuth();
    const [isAdding, setIsAdding] = React.useState<boolean>(false);
    const { toast } = useToast();
    
    const columns = React.useMemo(() => getColumns(faculty), [faculty]);

    const handleAddSave = (data: Omit<ClassFacultyMapping, 'id'>) => {
        addMapping(data);
        toast({ title: "Mapping Added", description: `The new mapping has been created.` });
        setIsAdding(false);
    };

  return (
    <Card className="shadow-2xl">
        <CardHeader>
            <CardTitle>Class-Faculty Mappings</CardTitle>
            <CardDescription>Assign faculty and subjects to classes.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="flex justify-end mb-4">
                 <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Mapping
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                         <DialogHeader>
                            <DialogTitle>Add New Mapping</DialogTitle>
                            <DialogDescription>Create a new class-faculty assignment.</DialogDescription>
                        </DialogHeader>
                        <MappingForm onSave={handleAddSave} onCancel={() => setIsAdding(false)}/>
                    </DialogContent>
                </Dialog>
            </div>

            <DataTable 
                columns={columns} 
                data={mappings}
                filterColumn="class_name"
                filterPlaceholder="Filter by class name..."
             />
        </CardContent>
    </Card>
  )
}

    