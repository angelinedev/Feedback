
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
import type { Faculty } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { useAuth } from "@/hooks/use-auth"

interface FacultyTableProps {
}

const facultySchema = z.object({
    id: z.string().optional(),
    faculty_id: z.string().min(3, "ID must be at least 3 digits").max(4, "ID must be at most 4 digits"),
    name: z.string().min(1, "Name is required."),
    department: z.string().min(1, "Department is required."),
    password: z.string().min(6, "Password must be at least 6 characters."),
});

const FacultyForm = ({ faculty, onSave, onCancel }: { faculty?: Faculty; onSave: (data: Omit<Faculty, 'id'>) => void; onCancel: () => void; }) => {
    const { faculty: allFaculty } = useAuth();
    const existingFacultyIds = React.useMemo(() => new Set(allFaculty.map(f => f.faculty_id)), [allFaculty]);

    const formSchema = facultySchema.extend({
        faculty_id: z.string().min(3, "ID must be at least 3 digits").max(4, "ID must be at most 4 digits").refine(val => {
            if (faculty?.faculty_id === val) return true;
            return !existingFacultyIds.has(val);
        }, "This Faculty ID already exists."),
        password: faculty ? z.string().optional().refine(val => !val || val.length >= 6, "New password must be at least 6 characters.") : z.string().min(6, "Password must be at least 6 characters."),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: faculty ? { ...faculty, password: "" } : { faculty_id: "", name: "", department: "", password: "" },
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
                    name="faculty_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Faculty ID</FormLabel>
                            <FormControl>
                                <Input placeholder="3-4 digit ID" {...field} disabled={!!faculty} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Faculty member's name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Department</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Computer Science" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder={faculty ? "Leave blank to keep current password" : "Set a password"} {...field} />
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

const ActionsCell = ({ faculty }: { faculty: Faculty; }) => {
    const { updateFaculty, deleteFaculty, updateFacultyPassword } = useAuth();
    const [isEditing, setIsEditing] = React.useState(false);
    const { toast } = useToast();
    
    const handleEditSave = async (data: Omit<Faculty, 'id'>) => {
        const { password, ...updateData } = data;
        await updateFaculty(faculty.id, updateData);
        if(password) {
            await updateFacultyPassword(faculty.id, password);
        }
        toast({ title: "Faculty Updated", description: `${data.name} has been updated.` });
        setIsEditing(false);
    };

    const handleDelete = () => {
        if(confirm(`Are you sure you want to delete ${faculty.name}?`)) {
            deleteFaculty(faculty.id);
            toast({ title: "Faculty Deleted", description: `${faculty.name} has been removed.` });
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
                    <DialogTitle>Edit Faculty</DialogTitle>
                    <DialogDescription>Update the details for this faculty member.</DialogDescription>
                </DialogHeader>
                <FacultyForm faculty={faculty} onSave={handleEditSave} onCancel={() => setIsEditing(false)} />
            </DialogContent>
        </Dialog>
     </>
    );
};

const getColumns = (): ColumnDef<Faculty>[] => [
  {
    accessorKey: "faculty_id",
    header: "Faculty ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell faculty={row.original} />,
  },
];

export function FacultyTable({}: FacultyTableProps) {
    const { faculty, addFaculty } = useAuth();
    const [isAdding, setIsAdding] = React.useState(false);
    const { toast } = useToast();
    
    const columns = React.useMemo(() => getColumns(), []);

    const handleAddSave = async (data: Omit<Faculty, 'id'>) => {
        const { password, ...facultyData } = data;
        await addFaculty(facultyData, password!);
        toast({ title: "Faculty Added", description: `${data.name} has been added.` });
        setIsAdding(false);
    };

  return (
    <Card className="shadow-2xl">
        <CardHeader>
            <CardTitle>Faculty</CardTitle>
            <CardDescription>Add, edit, and remove faculty records.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-end mb-4">
                 <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Faculty
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Faculty</DialogTitle>
                            <DialogDescription>Enter the details for the new faculty member.</DialogDescription>
                        </DialogHeader>
                        <FacultyForm onSave={handleAddSave} onCancel={() => setIsAdding(false)} />
                    </DialogContent>
                </Dialog>
            </div>
            <DataTable 
                columns={columns} 
                data={faculty}
                filterColumn="name"
                filterPlaceholder="Filter by name..."
             />
        </CardContent>
    </Card>
  )
}

    